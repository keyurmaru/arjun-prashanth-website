import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminUserInputSchema } from "@/lib/validation";
import { listAdminUsers, createAdminUser } from "@/lib/adminUsers";
import { logAction } from "@/lib/auditLog";

export async function GET() {
  const users = await listAdminUsers();
  return NextResponse.json({ ok: true, users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = adminUserInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  let userId: number;
  try {
    userId = await createAdminUser(parsed.data);
  } catch (err) {
    const message = err instanceof Error && err.message.includes("Duplicate") ? "That email is already in use." : "Could not create the user.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  await logAction(session, "user.create", "admin_user", userId, { email: parsed.data.email, role: parsed.data.role });
  return NextResponse.json({ ok: true, id: userId });
}
