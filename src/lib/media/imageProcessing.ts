import sharp from "sharp";

// No ffmpeg on this shared-hosting account, so uploaded video is stored and
// served as-is (no server-side transcoding/poster extraction) — admins are
// asked to upload web-ready MP4/H.264 files. Images do get real
// optimization below, since sharp is pure Node + prebuilt binaries and
// needs no extra system dependency.

export async function readImageMeta(input: string | Buffer): Promise<{ width: number | null; height: number | null }> {
  try {
    const meta = await sharp(input).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

// Only a fixed set of widths is servable on the fly — anything else falls
// back to the nearest allowed size. Keeps the resize cache from growing
// unbounded and matches the doc's named breakpoints closely enough
// (thumbnail/card/tablet/desktop/large detail).
export const ALLOWED_WIDTHS = [160, 400, 800, 1200, 1920] as const;
export type AllowedWidth = (typeof ALLOWED_WIDTHS)[number];

export function nearestAllowedWidth(requested: number): AllowedWidth {
  let best: AllowedWidth = ALLOWED_WIDTHS[0];
  let bestDiff = Infinity;
  for (const w of ALLOWED_WIDTHS) {
    const diff = Math.abs(w - requested);
    if (diff < bestDiff) {
      best = w;
      bestDiff = diff;
    }
  }
  return best;
}

export async function resizeToWebp(input: string | Buffer, width: AllowedWidth): Promise<Buffer> {
  return sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
