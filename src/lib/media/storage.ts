import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Uploaded files must live OUTSIDE hbuilds/versions/* — every deploy moves a
// fresh checkout into a new versions/gha-<timestamp>/ directory and prunes
// old ones (see hbuilds/deploy.sh), which would silently delete anything
// stored under the app's own directory tree. MEDIA_STORAGE_DIR points at a
// sibling directory (hbuilds/media-storage) that deploy.sh never touches.
// Falls back to a local ./media-storage for `npm run dev`.
function getStorageDir(): string {
  return process.env.MEDIA_STORAGE_DIR || path.join(process.cwd(), "media-storage");
}

export function newStorageKey(originalFilename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = path.extname(originalFilename).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${year}/${month}/${randomUUID()}${ext}`;
}

function resolveSafe(storageKey: string): string {
  const dir = getStorageDir();
  const resolved = path.resolve(dir, storageKey);
  // storageKey always originates from newStorageKey() (server-generated,
  // never user input) — this check is defense in depth against path
  // traversal if that ever changes.
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

export async function writeFile(storageKey: string, data: Buffer): Promise<void> {
  const filePath = resolveSafe(storageKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, data);
}

/** Moves an already-written temp file (e.g. from the streaming upload
 * handler) into its final storage location. Falls back to copy+delete if
 * the temp path is on a different filesystem (rename() can't cross
 * devices). */
export async function moveFile(tmpPath: string, storageKey: string): Promise<void> {
  const filePath = resolveSafe(storageKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EXDEV") {
      await fs.copyFile(tmpPath, filePath);
      await fs.unlink(tmpPath);
    } else {
      throw err;
    }
  }
}

export async function readFile(storageKey: string): Promise<Buffer> {
  return fs.readFile(resolveSafe(storageKey));
}

export async function fileExists(storageKey: string): Promise<boolean> {
  try {
    await fs.access(resolveSafe(storageKey));
    return true;
  } catch {
    return false;
  }
}

export async function deleteFile(storageKey: string): Promise<void> {
  try {
    await fs.unlink(resolveSafe(storageKey));
  } catch {
    // Already gone — fine.
  }
}

/** Removes the original plus any resized-derivative cache files the
 * media-files route generated for it (see src/app/media-files/[...path]/
 * route.ts's `__wNNN.webp` cache naming) — otherwise a deleted original
 * leaves orphaned derivatives behind indefinitely. */
export async function deleteFileWithDerivatives(storageKey: string): Promise<void> {
  const ext = path.extname(storageKey);
  const base = storageKey.slice(0, -ext.length || undefined);
  const dir = path.dirname(resolveSafe(storageKey));
  const baseName = path.basename(base);

  await deleteFile(storageKey);
  try {
    const entries = await fs.readdir(dir);
    await Promise.all(
      entries
        .filter((name) => name.startsWith(`${baseName}__w`) && name.endsWith(".webp"))
        .map((name) => fs.unlink(path.join(dir, name)).catch(() => {})),
    );
  } catch {
    // Directory already gone or empty — fine.
  }
}

export function resolvedPath(storageKey: string): string {
  return resolveSafe(storageKey);
}

/** Public URL for a stored file, served by src/app/media-files/[...path]/route.ts. */
export function mediaUrlFor(storageKey: string): string {
  return `/media-files/${storageKey}`;
}
