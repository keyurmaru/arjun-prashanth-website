import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Excludes visually-ambiguous characters (0/O, 1/l/I) since this is meant
// to be read out of an email and typed, not just pasted.
const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** A random password for a newly auto-created customer account, emailed
 * directly to them — see fulfillOrder.ts. Not shown anywhere in the UI. */
export function generatePassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) out += PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)];
  return out;
}
