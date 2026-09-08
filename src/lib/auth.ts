import { SignJWT, jwtVerify } from "jose";

export type AdminRole = "SUPER_ADMIN" | "CONTENT_MANAGER" | "ORDER_MANAGER" | "VIEWER";

export interface SessionPayload {
  sub: number;
  email: string;
  role: AdminRole;
  name: string;
}

export const SESSION_COOKIE = "apr_admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  // JWT's `sub` claim is a string per spec (and jose's types enforce that) —
  // carry the numeric admin id as `sub` converted to a string.
  return new SignJWT({ email: payload.email, role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = Number(payload.sub);
    if (
      !Number.isFinite(sub) ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return { sub, email: payload.email, role: payload.role as AdminRole, name: payload.name };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Role hierarchy for module access. Kept explicit (no numeric ranking) so
 * a new role must be deliberately added to every module it should reach —
 * silent access via a "higher number" convention is exactly how RBAC bugs
 * creep in. */
export const ROLE_ACCESS: Record<string, AdminRole[]> = {
  books: ["SUPER_ADMIN", "CONTENT_MANAGER"],
  orders_write: ["SUPER_ADMIN", "ORDER_MANAGER"],
  orders_read: ["SUPER_ADMIN", "ORDER_MANAGER", "VIEWER"],
  users: ["SUPER_ADMIN"],
  settings: ["SUPER_ADMIN"],
  dashboard: ["SUPER_ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER", "VIEWER"],
};

export function hasAccess(role: AdminRole, module: keyof typeof ROLE_ACCESS): boolean {
  return ROLE_ACCESS[module].includes(role);
}
