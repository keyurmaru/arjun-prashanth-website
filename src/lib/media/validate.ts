// Magic-byte sniffing so a renamed/mislabelled file can't slip past the
// declared MIME type — the doc's "reject executable files disguised as
// videos" requirement. Deliberately hand-rolled (no extra dependency) since
// the supported format list is small and fixed.

export type DetectedKind = { type: "image" | "video"; mime: string; ext: string } | null;

function matches(buf: Buffer, offset: number, bytes: number[]): boolean {
  if (buf.length < offset + bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buf[offset + i] !== bytes[i]) return false;
  }
  return true;
}

export function detectFileType(buf: Buffer): DetectedKind {
  // Images
  if (matches(buf, 0, [0xff, 0xd8, 0xff])) return { type: "image", mime: "image/jpeg", ext: ".jpg" };
  if (matches(buf, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { type: "image", mime: "image/png", ext: ".png" };
  if (matches(buf, 0, [0x47, 0x49, 0x46, 0x38])) return { type: "image", mime: "image/gif", ext: ".gif" };
  if (matches(buf, 0, [0x52, 0x49, 0x46, 0x46]) && matches(buf, 8, [0x57, 0x45, 0x42, 0x50])) {
    return { type: "image", mime: "image/webp", ext: ".webp" };
  }

  // Video containers
  if (matches(buf, 4, [0x66, 0x74, 0x79, 0x70])) {
    // ISO base media file format ("....ftyp"): mp4, mov, m4v, etc.
    return { type: "video", mime: "video/mp4", ext: ".mp4" };
  }
  if (matches(buf, 0, [0x1a, 0x45, 0xdf, 0xa3])) return { type: "video", mime: "video/webm", ext: ".webm" };

  return null;
}

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_BYTES = 300 * 1024 * 1024; // 300MB — no server-side transcoding, see imageProcessing.ts note.
