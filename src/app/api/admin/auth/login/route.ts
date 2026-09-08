import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, type AdminRole } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";
import type { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`admin-login:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { email, password } = (body as Record<string, unknown>) || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM admin_users WHERE email = ? AND active = 1`,
    [email.trim().toLowerCase()],
  );
  const user = rows[0];

  // Same generic error whether the email doesn't exist or the password is
  // wrong — don't let login responses reveal which admin emails are valid.
  const genericError = () => NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });

  if (!user) return genericError();
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return genericError();

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
