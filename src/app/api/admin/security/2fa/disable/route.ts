import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPool } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyToken } from "@/lib/totp";
import { logAction } from "@/lib/auditLog";
import { isRateLimited } from "@/lib/rateLimit";
import type { RowDataPacket } from "mysql2";

// Requires the account password AND a current TOTP code — not just an
// active session — so a stolen/hijacked session cookie alone can't turn
// off an account's 2FA protection.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (isRateLimited(`2fa-disable:${session.sub}`)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { password, code } = (body as Record<string, unknown>) || {};
  if (typeof password !== "string" || typeof code !== "string") {
    return NextResponse.json({ ok: false, error: "Password and current 2FA code are required." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT password_hash, totp_secret FROM admin_users WHERE id = ?`,
    [session.sub],
  );
  const user = rows[0];
  const genericError = () => NextResponse.json({ ok: false, error: "Password or code was incorrect." }, { status: 401 });
  if (!user) return genericError();

  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) return genericError();
  if (!user.totp_secret || !(await verifyToken(code.trim(), user.totp_secret))) return genericError();

  await pool.execute(`UPDATE admin_users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?`, [session.sub]);
  await pool.execute(`DELETE FROM admin_totp_backup_codes WHERE admin_user_id = ?`, [session.sub]);

  await logAction(session, "admin.2fa_disabled", "admin_user", session.sub);

  return NextResponse.json({ ok: true });
}
