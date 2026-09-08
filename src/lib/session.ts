import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth";

/** Reads and verifies the admin session from cookies — for use in server
 * components and route handlers. Middleware does its own cookie read
 * (req.cookies) since next/headers isn't available there in the same way. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
