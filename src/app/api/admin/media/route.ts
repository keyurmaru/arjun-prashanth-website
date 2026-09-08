import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasAccess } from "@/lib/auth";
import { listMedia, type MediaType, type MediaStatus } from "@/lib/mediaRepo";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (!hasAccess(session.role, "media")) return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as MediaType | null;
  const status = searchParams.get("status") as MediaStatus | null;
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const page = Number(searchParams.get("page") || 1);

  const result = await listMedia({
    type: type || undefined,
    status: status || undefined,
    search,
    category,
    page,
  });

  return NextResponse.json({ ok: true, ...result });
}
