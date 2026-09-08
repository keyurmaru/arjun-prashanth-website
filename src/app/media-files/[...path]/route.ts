import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile, writeFile, fileExists, resolvedPath } from "@/lib/media/storage";
import { resizeToWebp, nearestAllowedWidth } from "@/lib/media/imageProcessing";

export const dynamic = "force-dynamic";

const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

// Serves files from the persistent, deploy-safe media-storage directory
// (see src/lib/media/storage.ts) rather than Next's public/ folder, which
// gets wiped and replaced on every deploy. Content-addressed-ish filenames
// (random UUID per upload, a new one on every "replace") mean this can be
// cached aggressively forever with no invalidation problem.
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const storageKey = segments.join("/");
  const ext = path.extname(storageKey).toLowerCase();
  const mime = EXT_MIME[ext];
  if (!mime) return new NextResponse("Not found.", { status: 404 });

  if (!(await fileExists(storageKey))) {
    return new NextResponse("Not found.", { status: 404 });
  }

  const widthParam = req.nextUrl.searchParams.get("w");
  if (widthParam && IMAGE_EXTS.has(ext)) {
    const requested = Number(widthParam);
    if (Number.isFinite(requested) && requested > 0) {
      const width = nearestAllowedWidth(requested);
      const cacheKey = `${storageKey.slice(0, -ext.length)}__w${width}.webp`;
      let data: Buffer;
      if (await fileExists(cacheKey)) {
        data = await readFile(cacheKey);
      } else {
        data = await resizeToWebp(resolvedPath(storageKey), width);
        await writeFile(cacheKey, data);
      }
      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  const data = await readFile(storageKey);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
