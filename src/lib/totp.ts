import { generateSecret as otplibGenerateSecret, verify, generateURI } from "otplib";
import QRCode from "qrcode";
import { randomBytes } from "crypto";

// otplib v13's defaults (30s step, 6 digits, SHA1, Base32 secret) match
// every mainstream authenticator app (Google Authenticator, Authy,
// 1Password, ...) — left untouched deliberately for compatibility.
const TOLERANCE_SECONDS = 30; // accept one time-step of clock drift either side

export function generateSecret(): string {
  return otplibGenerateSecret();
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token, epochTolerance: TOLERANCE_SECONDS });
    return result.valid;
  } catch {
    return false;
  }
}

export function provisioningUri(secret: string, accountEmail: string): string {
  return generateURI({ issuer: "Arjun Prashanth Admin", label: accountEmail, secret });
}

export async function qrCodeDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, { margin: 1, width: 240 });
}

const BACKUP_CODE_COUNT = 8;

/** Human-typeable recovery codes (e.g. "7F3K-9QRT") for when the
 * authenticator device is lost. Caller is responsible for hashing before
 * storage and showing these to the admin exactly once. */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const raw = randomBytes(5).toString("hex").toUpperCase(); // 10 hex chars
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
  }
  return codes;
}
