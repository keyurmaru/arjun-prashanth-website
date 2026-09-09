import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPool } from "@/lib/db";
import { generateSecret, provisioningUri, qrCodeDataUrl } from "@/lib/totp";

// Starts (or restarts) enrollment: generates a fresh secret and stores it
// un-enabled (totp_enabled stays 0) until /confirm proves the admin
// actually scanned it — never flips an account into "protected" based on
// a secret nobody has confirmed reading correctly.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const secret = generateSecret();
  const pool = getPool();
  await pool.execute(`UPDATE admin_users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?`, [secret, session.sub]);

  const uri = provisioningUri(secret, session.email);
  const qrDataUrl = await qrCodeDataUrl(uri);

  return NextResponse.json({ ok: true, secret, qrDataUrl });
}
