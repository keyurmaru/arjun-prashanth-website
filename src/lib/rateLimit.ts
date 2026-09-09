// Simple in-memory sliding-window rate limiter. This is process-local: it
// resets on redeploy/restart and does not share state across multiple server
// instances. That's an accepted limitation for a single small Node app; if
// the site is later scaled horizontally, replace this with a shared store
// (e.g. Redis / Upstash) behind the same isAllowed() signature.
const hits = new Map<string, number[]>();

const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_MAX_REQUESTS = 5;

export interface RateLimitOptions {
  /** Requests allowed within the window before isRateLimited() returns true. */
  max?: number;
  windowMs?: number;
}

export function isRateLimited(key: string, options?: RateLimitOptions): boolean {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options?.max ?? DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return timestamps.length > max;
}
