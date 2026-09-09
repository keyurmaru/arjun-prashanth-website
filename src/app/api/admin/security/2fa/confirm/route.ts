import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPool } from "@/lib/db";
import { verifyToken, generateBackupCodes } from "@/lib/totp";
import { hashPassword } from "@/lib/password";
import { logAction } from "@/lib/auditLog";
import { isRateLimited } from "@/lib/rateLimit";
import type { RowDataPacket } from "mysql2";

// Proves the admin actually scanned the QR from /setup by requiring one
// valid current code before turning 2FA on. Issues a fresh set of backup
// codes at the same time — shown to the admin exactly once in the
// response; only their bcrypt hashes are ever stored.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  if (isRateLimited(`2fa-confirm:${session.sub}`)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { code } = (body as Record<string, unknown>) || {};
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ ok: false, error: "Enter the 6-digit code from your authenticator app." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT totp_secret FROM admin_users WHERE id = ?`, [session.sub]);
  const secret = rows[0]?.totp_secret;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Start setup again — no pending secret found." }, { status: 400 });
  }
  if (!(await verifyToken(code.trim(), secret))) {
    return NextResponse.json({ ok: false, error: "That code didn't match. Check the time on your device and try again." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  const backupCodes = generateBackupCodes();
  try {
    await conn.beginTransaction();
    await conn.execute(`UPDATE admin_users SET totp_enabled = 1 WHERE id = ?`, [session.sub]);
    // Replaces any previous set — confirming setup again invalidates old
    // backup codes rather than accumulating them indefinitely.
    await conn.execute(`DELETE FROM admin_totp_backup_codes WHERE admin_user_id = ?`, [session.sub]);
    for (const plain of backupCodes) {
      const hash = await hashPassword(plain);
      await conn.execute(`INSERT INTO admin_totp_backup_codes (admin_user_id, code_hash) VALUES (?, ?)`, [session.sub, hash]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  await logAction(session, "admin.2fa_enabled", "admin_user", session.sub);

  return NextResponse.json({ ok: true, backupCodes });
}
