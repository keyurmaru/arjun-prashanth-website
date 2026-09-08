interface SpamCheckInput {
  honeypot: string;
  formRenderedAt?: number;
  turnstileToken?: string;
}

const MIN_FILL_TIME_MS = 2500;

/** Honeypot + minimum-fill-time check. Always runs, with zero external
 * dependencies or configuration required. */
export function looksLikeSpam({ honeypot, formRenderedAt }: SpamCheckInput): boolean {
  if (honeypot && honeypot.trim() !== "") return true;
  if (formRenderedAt && Date.now() - formRenderedAt < MIN_FILL_TIME_MS) return true;
  return false;
}

/** Verifies a Cloudflare Turnstile token server-side. Returns true (pass)
 * when Turnstile isn't configured yet, so the form still works with just
 * the honeypot/timing/rate-limit checks until real keys are added. */
export async function verifyTurnstile(token: string | undefined, remoteIp: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
