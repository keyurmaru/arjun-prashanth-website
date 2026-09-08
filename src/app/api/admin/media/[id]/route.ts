import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { getMediaById, updateMedia, deleteMediaRow, findUsages } from "@/lib/mediaRepo";
import { deleteFile } from "@/lib/media/storage";
import { mediaUpdateSchema } from "@/lib/validation";
import { logAction } from "@/lib/auditLog";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "media")) return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  const media = await getMediaById(Number(id));
  if (!media) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  const usages = await findUsages(media.url);
  return NextResponse.json({ ok: true, media, usages });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "media")) return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  const mediaId = Number(id);
  const existing = await getMediaById(mediaId);
  if (!existing) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = mediaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await updateMedia(mediaId, parsed.data, session.sub);
  await logAction(session, "media.update", "media", mediaId, parsed.data);

  const media = await getMediaById(mediaId);
  return NextResponse.json({ ok: true, media });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "media")) return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  const mediaId = Number(id);
  const existing = await getMediaById(mediaId);
  if (!existing) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const force = new URL(req.url).searchParams.get("force") === "1";
  const usages = await findUsages(existing.url);
  if (usages.length > 0 && !force) {
    return NextResponse.json({ ok: false, error: "This media is used elsewhere.", usages }, { status: 409 });
  }

  const storageKey = await deleteMediaRow(mediaId);
  if (storageKey) await deleteFile(storageKey);
  await logAction(session, "media.delete", "media", mediaId, { forced: force, usageCount: usages.length });

  return NextResponse.json({ ok: true });
}
