import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, verifyPending2FAToken, SESSION_COOKIE, SESSION_MAX_AGE, type AdminRole } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";
import { verifyToken } from "@/lib/totp";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// Second step of login when the account has 2FA enabled — takes the
// short-lived pendingToken from /api/admin/auth/login plus either a
// 6-digit authenticator code or a single-use backup code.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Strict: this endpoint accepts a 6-digit code, so it needs the same
  // brute-force resistance as the password step itself.
  if (isRateLimited(`verify-2fa:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { pendingToken, code, backupCode } = (body as Record<string, unknown>) || {};
  if (typeof pendingToken !== "string" || (typeof code !== "string" && typeof backupCode !== "string")) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const userId = await verifyPending2FAToken(pendingToken);
  const genericError = () => NextResponse.json({ ok: false, error: "Invalid or expired code." }, { status: 401 });
  if (!userId) return genericError();

  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM admin_users WHERE id = ? AND active = 1 AND totp_enabled = 1`,
    [userId],
  );
  const user = rows[0];
  if (!user || !user.totp_secret) return genericError();

  let authenticated = false;

  if (typeof code === "string" && code.trim()) {
    authenticated = await verifyToken(code.trim(), user.totp_secret);
  } else if (typeof backupCode === "string" && backupCode.trim()) {
    const [codeRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM admin_totp_backup_codes WHERE admin_user_id = ? AND used_at IS NULL`,
      [userId],
    );
    for (const row of codeRows) {
      if (await verifyPassword(backupCode.trim().toUpperCase(), row.code_hash)) {
        await pool.execute<ResultSetHeader>(`UPDATE admin_totp_backup_codes SET used_at = NOW() WHERE id = ?`, [row.id]);
        authenticated = true;
        break;
      }
    }
  }

  if (!authenticated) return genericError();

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role as AdminRole,
    name: user.name,
  });

  const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
