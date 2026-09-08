import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { bulkUpdateMedia } from "@/lib/mediaRepo";
import { mediaBulkUpdateSchema } from "@/lib/validation";
import { logAction } from "@/lib/auditLog";

// Shared metadata update across a selected batch (category/tags/rights/
// status) — individual fields like alt text stay per-item via
// /api/admin/media/[id].
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "media")) return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = mediaBulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { ids, ...updates } = parsed.data;
  await bulkUpdateMedia(ids, updates, session.sub);
  await logAction(session, "media.bulk_update", "media", ids.join(","), updates);

  return NextResponse.json({ ok: true, count: ids.length });
}
