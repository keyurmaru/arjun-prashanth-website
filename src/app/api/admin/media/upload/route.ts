import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { promises as fsp, createWriteStream } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";
import { detectFileType, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/media/validate";
import { readImageMeta } from "@/lib/media/imageProcessing";
import { newStorageKey, moveFile } from "@/lib/media/storage";
import { createMedia } from "@/lib/mediaRepo";
import { logAction } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

// Streams the multipart body straight to a temp file on disk (never
// buffers the whole upload in memory) — important under this host's
// CloudLinux LVE memory limits for anything video-sized. Magic bytes are
// sniffed from the first chunk to determine the real type; the declared
// filename/Content-Type from the browser are never trusted for that.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "media")) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }
  // Generous enough for a real bulk upload (one request per file — see
  // UploadZone.tsx) while still bounding a compromised session or a
  // runaway client retry loop from filling disk unattended.
  if (isRateLimited(`media-upload:${session.sub}`, { max: 120, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ ok: false, error: "Too many uploads. Please wait a few minutes and try again." }, { status: 429 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Expected a multipart/form-data upload." }, { status: 400 });
  }
  if (!req.body) {
    return NextResponse.json({ ok: false, error: "Empty request body." }, { status: 400 });
  }

  const tmpPath = path.join(os.tmpdir(), `apr-upload-${randomUUID()}`);
  let originalFilename = "upload";
  let bytesWritten = 0;
  let headChunk = Buffer.alloc(0);
  let tooLarge = false;
  let sawFile = false;

  await new Promise<void>((resolve, reject) => {
    const bb = Busboy({ headers: { "content-type": contentType } });
    let fileFinished = Promise.resolve();

    bb.on("file", (_name, stream, info) => {
      sawFile = true;
      originalFilename = info.filename || "upload";
      const ws = createWriteStream(tmpPath);
      fileFinished = new Promise((res, rej) => {
        ws.on("finish", res);
        ws.on("error", rej);
      });

      stream.on("data", (chunk: Buffer) => {
        bytesWritten += chunk.length;
        if (headChunk.length < 4100) headChunk = Buffer.concat([headChunk, chunk]).subarray(0, 4100);
        if (bytesWritten > MAX_VIDEO_BYTES) {
          tooLarge = true;
          stream.unpipe(ws);
          ws.destroy();
          stream.resume();
        }
      });

      stream.pipe(ws);
    });

    bb.on("error", reject);
    bb.on("close", () => {
      fileFinished.then(resolve).catch(reject);
    });

    Readable.fromWeb(req.body as never).pipe(bb);
  });

  if (!sawFile) {
    await fsp.unlink(tmpPath).catch(() => {});
    return NextResponse.json({ ok: false, error: "No file was uploaded." }, { status: 400 });
  }
  if (tooLarge) {
    await fsp.unlink(tmpPath).catch(() => {});
    return NextResponse.json({ ok: false, error: "File exceeds the 300MB upload limit." }, { status: 413 });
  }

  const detected = detectFileType(headChunk);
  if (!detected) {
    await fsp.unlink(tmpPath).catch(() => {});
    return NextResponse.json({ ok: false, error: "Unrecognized file type. Supported: JPEG, PNG, GIF, WebP, MP4, WebM." }, { status: 400 });
  }
  const maxBytes = detected.type === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (bytesWritten > maxBytes) {
    await fsp.unlink(tmpPath).catch(() => {});
    const limitLabel = detected.type === "image" ? "15MB" : "300MB";
    return NextResponse.json({ ok: false, error: `${detected.type === "image" ? "Image" : "Video"} exceeds the ${limitLabel} limit.` }, { status: 413 });
  }
  if (bytesWritten === 0) {
    await fsp.unlink(tmpPath).catch(() => {});
    return NextResponse.json({ ok: false, error: "Uploaded file is empty." }, { status: 400 });
  }

  let width: number | null = null;
  let height: number | null = null;
  if (detected.type === "image") {
    const meta = await readImageMeta(tmpPath);
    width = meta.width;
    height = meta.height;
  }

  const storageKey = newStorageKey(`file${detected.ext}`);
  await moveFile(tmpPath, storageKey);

  const media = await createMedia({
    type: detected.type,
    storageKey,
    originalFilename,
    mimeType: detected.mime,
    sizeBytes: bytesWritten,
    width,
    height,
    createdBy: session.sub,
  });

  await logAction(session, "media.upload", "media", media.id, { originalFilename, type: detected.type, sizeBytes: bytesWritten });

  return NextResponse.json({ ok: true, media });
}
