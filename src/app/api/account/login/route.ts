import { NextRequest, NextResponse } from "next/server";
import { verifyCustomerPassword } from "@/lib/customersRepo";
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customerAuth";
import { isRateLimited, isBypassedIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!isBypassedIp(ip) && isRateLimited(`account-login:${ip}`)) {
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

  // Same generic error whether the email doesn't exist or the password is
  // wrong — don't let responses reveal which emails have accounts.
  const customer = await verifyCustomerPassword(email, password);
  if (!customer) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createCustomerSessionToken({ sub: customer.id, email: customer.email, name: customer.name });
  const res = NextResponse.json({ ok: true, name: customer.name });
  res.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_MAX_AGE,
  });
  return res;
}
