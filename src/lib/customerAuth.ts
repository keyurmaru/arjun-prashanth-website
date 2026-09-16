import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface CustomerSessionPayload {
  sub: number; // customer id
  email: string;
  name: string;
}

export const CUSTOMER_SESSION_COOKIE = "apr_customer_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days — longer than the admin session, this is a low-privilege account
export const CUSTOMER_SESSION_MAX_AGE = SESSION_TTL_SECONDS;

// Reuses the same signing secret as the admin session (src/lib/auth.ts) —
// both are just HMAC keys for this app's own JWTs, kept distinct from each
// other by cookie name and payload shape (a customer token has no `role`
// claim, an admin token has no `purpose:"customer"` claim), the same
// pattern already used for the pending-2FA token. Avoids requiring a
// second secret to be provisioned on the server for what's still just
// "this app's session signing key."
function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

export async function createCustomerSessionToken(payload: CustomerSessionPayload): Promise<string> {
  return new SignJWT({ purpose: "customer", email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyCustomerSessionToken(token: string): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = Number(payload.sub);
    if (
      payload.purpose !== "customer" ||
      !Number.isFinite(sub) ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return { sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

/** Reads and verifies the customer session from cookies — for use in
 * server components and route handlers, mirroring src/lib/session.ts's
 * admin equivalent. */
export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerSessionToken(token);
}
