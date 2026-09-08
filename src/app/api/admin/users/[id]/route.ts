import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { setAdminUserActive, setAdminUserRole } from "@/lib/adminUsers";
import { logAction } from "@/lib/auditLog";

const patchSchema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["SUPER_ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER", "VIEWER"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);

  if (userId === session.sub) {
    return NextResponse.json({ ok: false, error: "You cannot change your own role or access here." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid update." }, { status: 400 });

  if (parsed.data.active !== undefined) await setAdminUserActive(userId, parsed.data.active);
  if (parsed.data.role !== undefined) await setAdminUserRole(userId, parsed.data.role);

  await logAction(session, "user.update", "admin_user", userId, parsed.data);
  return NextResponse.json({ ok: true });
}
