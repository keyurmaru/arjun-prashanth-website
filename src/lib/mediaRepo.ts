import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { mediaUrlFor } from "@/lib/media/storage";

export type MediaType = "image" | "video";
export type MediaStatus = "DRAFT" | "APPROVED" | "ARCHIVED";
export type RightsStatus = "NOT_VERIFIED" | "APPROVED_FOR_PUBLICATION" | "RESTRICTED";

export interface MediaRecord {
  id: number;
  type: MediaType;
  url: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  title: string | null;
  altText: string | null;
  caption: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  credit: string | null;
  rightsOwner: string | null;
  rightsStatus: RightsStatus;
  category: string | null;
  projectTag: string | null;
  tags: string | null;
  featured: boolean;
  featuredOrder: number;
  status: MediaStatus;
  createdAt: string;
  updatedAt: string;
}

function hydrate(row: RowDataPacket): MediaRecord {
  return {
    id: row.id,
    type: row.type,
    url: mediaUrlFor(row.storage_key),
    storageKey: row.storage_key,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    title: row.title,
    altText: row.alt_text,
    caption: row.caption,
    description: row.description,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    keywords: row.keywords,
    credit: row.credit,
    rightsOwner: row.rights_owner,
    rightsStatus: row.rights_status,
    category: row.category,
    projectTag: row.project_tag,
    tags: row.tags,
    featured: !!row.featured,
    featuredOrder: row.featured_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateMediaInput {
  type: MediaType;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdBy: number;
}

export async function createMedia(input: CreateMediaInput): Promise<MediaRecord> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO media (type, storage_key, original_filename, mime_type, size_bytes, width, height, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.type, input.storageKey, input.originalFilename, input.mimeType, input.sizeBytes, input.width, input.height, input.createdBy, input.createdBy],
  );
  const record = await getMediaById(result.insertId);
  if (!record) throw new Error("Failed to read back created media row.");
  return record;
}

export async function getMediaById(id: number): Promise<MediaRecord | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM media WHERE id = ?`, [id]);
  return rows[0] ? hydrate(rows[0]) : null;
}

export interface ListMediaFilters {
  type?: MediaType;
  status?: MediaStatus;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listMedia(filters: ListMediaFilters): Promise<{ items: MediaRecord[]; total: number }> {
  const pool = getPool();
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filters.type) {
    where.push("type = ?");
    params.push(filters.type);
  }
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters.search) {
    where.push("(original_filename LIKE ? OR title LIKE ? OR alt_text LIKE ? OR caption LIKE ? OR tags LIKE ? OR project_tag LIKE ?)");
    const term = `%${filters.search}%`;
    params.push(term, term, term, term, term, term);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const pageSize = Math.min(Math.max(filters.pageSize || 40, 1), 100);
  const page = Math.max(filters.page || 1, 1);
  const offset = (page - 1) * pageSize;

  const [countRows] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM media ${whereSql}`, params);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM media ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );

  return { items: rows.map(hydrate), total: countRows[0]?.total ?? 0 };
}

export interface UpdateMediaInput {
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  credit?: string | null;
  rightsOwner?: string | null;
  rightsStatus?: RightsStatus;
  category?: string | null;
  projectTag?: string | null;
  tags?: string | null;
  featured?: boolean;
  featuredOrder?: number;
  status?: MediaStatus;
}

const UPDATABLE_COLUMNS: Record<keyof UpdateMediaInput, string> = {
  title: "title",
  altText: "alt_text",
  caption: "caption",
  description: "description",
  seoTitle: "seo_title",
  seoDescription: "seo_description",
  keywords: "keywords",
  credit: "credit",
  rightsOwner: "rights_owner",
  rightsStatus: "rights_status",
  category: "category",
  projectTag: "project_tag",
  tags: "tags",
  featured: "featured",
  featuredOrder: "featured_order",
  status: "status",
};

export async function updateMedia(id: number, input: UpdateMediaInput, updatedBy: number): Promise<void> {
  const pool = getPool();
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  for (const key of Object.keys(input) as (keyof UpdateMediaInput)[]) {
    const column = UPDATABLE_COLUMNS[key];
    if (!column) continue;
    let value = input[key] as string | number | boolean | null | undefined;
    if (key === "featured") value = value ? 1 : 0;
    else if (value === "") value = null;
    sets.push(`${column} = ?`);
    params.push(value as string | number | null);
  }
  if (sets.length === 0) return;

  sets.push("updated_by = ?");
  params.push(updatedBy);
  params.push(id);

  await pool.execute(`UPDATE media SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function bulkUpdateMedia(ids: number[], input: UpdateMediaInput, updatedBy: number): Promise<void> {
  for (const id of ids) {
    await updateMedia(id, input, updatedBy);
  }
}

/** Deleting media removes both the DB row and the underlying file — callers
 * must check findUsages() first and refuse/warn if it's referenced
 * anywhere, per the doc's "used in N places" safeguard. */
export async function deleteMediaRow(id: number): Promise<string | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT storage_key FROM media WHERE id = ?`, [id]);
  if (!rows[0]) return null;
  await pool.execute(`DELETE FROM media WHERE id = ?`, [id]);
  return rows[0].storage_key;
}

export interface MediaUsage {
  location: string;
  editUrl: string;
}

/** Computed on demand (not a maintained relation table) — content editors
 * store the media's public URL directly in their existing image/video URL
 * columns, so "used in" is just a reverse text search across those. Good
 * enough for a personal-site-scale library; a real relation table would be
 * the next step if the library grows large. */
export async function findUsages(mediaUrl: string): Promise<MediaUsage[]> {
  const pool = getPool();
  const usages: MediaUsage[] = [];

  const [filmPosters] = await pool.execute<RowDataPacket[]>(`SELECT id, title FROM films WHERE poster_url = ?`, [mediaUrl]);
  for (const f of filmPosters) usages.push({ location: `Film card image: ${f.title}`, editUrl: `/admin/films/${f.id}` });

  const [filmGallery] = await pool.execute<RowDataPacket[]>(
    `SELECT f.id, f.title FROM film_gallery g JOIN films f ON f.id = g.film_id WHERE g.image_url = ?`,
    [mediaUrl],
  );
  for (const f of filmGallery) usages.push({ location: `Film gallery: ${f.title}`, editUrl: `/admin/films/${f.id}` });

  const [filmVideoPosters] = await pool.execute<RowDataPacket[]>(
    `SELECT f.id, f.title FROM film_videos v JOIN films f ON f.id = v.film_id WHERE v.poster_url = ? OR v.video_url = ?`,
    [mediaUrl, mediaUrl],
  );
  for (const f of filmVideoPosters) usages.push({ location: `Film video: ${f.title}`, editUrl: `/admin/films/${f.id}` });

  const [bookCovers] = await pool.execute<RowDataPacket[]>(`SELECT id, title FROM books WHERE cover = ?`, [mediaUrl]);
  for (const b of bookCovers) usages.push({ location: `Book cover: ${b.title}`, editUrl: `/admin/books/${b.id}` });

  const [bookGallery] = await pool.execute<RowDataPacket[]>(
    `SELECT b.id, b.title FROM book_gallery g JOIN books b ON b.id = g.book_id WHERE g.image_url = ?`,
    [mediaUrl],
  );
  for (const b of bookGallery) usages.push({ location: `Book gallery: ${b.title}`, editUrl: `/admin/books/${b.id}` });

  return usages;
}
