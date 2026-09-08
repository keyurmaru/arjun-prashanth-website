import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";

export type FilmStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProjectType = "Feature Film" | "Short Film" | "Direction" | "Associate Direction" | "Assistant Direction" | "Editing";

export interface FilmGalleryImage {
  id: number;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

export interface FilmVideo {
  id: number;
  videoUrl: string;
  title: string | null;
  sortOrder: number;
}

export interface FilmRecord {
  id: number;
  slug: string;
  title: string;
  projectType: ProjectType;
  officialRole: string;
  genre: string;
  language: string;
  year: string | null;
  credits: string;
  synopsis: string | null;
  // The single image used on cards/listing grids — distinct from the full
  // gallery below, which is for the detail page only.
  posterUrl: string | null;
  gallery: FilmGalleryImage[];
  videos: FilmVideo[];
  status: FilmStatus;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

async function hydrateFilm(row: RowDataPacket): Promise<FilmRecord> {
  const pool = getPool();
  const [galleryRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM film_gallery WHERE film_id = ? ORDER BY sort_order ASC, id ASC`,
    [row.id],
  );
  const [videoRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM film_videos WHERE film_id = ? ORDER BY sort_order ASC, id ASC`,
    [row.id],
  );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    projectType: row.project_type,
    officialRole: row.official_role,
    genre: row.genre,
    language: row.language,
    year: row.year,
    credits: row.credits,
    synopsis: row.synopsis,
    posterUrl: row.poster_url,
    gallery: galleryRows.map((g) => ({ id: g.id, imageUrl: g.image_url, caption: g.caption, sortOrder: g.sort_order })),
    videos: videoRows.map((v) => ({ id: v.id, videoUrl: v.video_url, title: v.title, sortOrder: v.sort_order })),
    status: row.status,
    featured: !!row.featured,
    featuredOrder: row.featured_order,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

// ---- Public reads ----

export async function getPublishedFilmsPublic(): Promise<FilmRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM films WHERE status = 'PUBLISHED' ORDER BY sort_order ASC, created_at DESC`,
  );
  return Promise.all(rows.map(hydrateFilm));
}

export async function getFeaturedFilmsPublic(limit = 4): Promise<FilmRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM films WHERE status = 'PUBLISHED' AND featured = 1
     ORDER BY featured_order ASC, sort_order ASC LIMIT ?`,
    [limit],
  );
  if (rows.length > 0) return Promise.all(rows.map(hydrateFilm));

  // Fallback per the CMS doc's featured algorithm: if nothing is
  // explicitly featured, fall back to latest published rather than
  // showing an empty homepage section.
  const [fallbackRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM films WHERE status = 'PUBLISHED' ORDER BY sort_order ASC, created_at DESC LIMIT ?`,
    [limit],
  );
  return Promise.all(fallbackRows.map(hydrateFilm));
}

export async function getFilmPublicBySlug(slug: string): Promise<FilmRecord | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM films WHERE slug = ? AND status = 'PUBLISHED'`, [
    slug,
  ]);
  return rows[0] ? hydrateFilm(rows[0]) : null;
}

// ---- Admin reads/writes ----

export async function listFilmsAdmin(): Promise<FilmRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM films ORDER BY sort_order ASC, created_at DESC`);
  return Promise.all(rows.map(hydrateFilm));
}

export async function getFilmAdminById(id: number): Promise<FilmRecord | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM films WHERE id = ?`, [id]);
  return rows[0] ? hydrateFilm(rows[0]) : null;
}

export interface FilmInput {
  slug: string;
  title: string;
  projectType: ProjectType;
  officialRole: string;
  genre: string;
  language: string;
  year?: string;
  credits: string;
  synopsis?: string;
  posterUrl?: string;
  gallery: { imageUrl: string; caption?: string }[];
  videos: { videoUrl: string; title?: string }[];
  status: FilmStatus;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

async function replaceGalleryAndVideos(conn: PoolConnection, filmId: number, input: FilmInput): Promise<void> {
  await conn.execute(`DELETE FROM film_gallery WHERE film_id = ?`, [filmId]);
  await conn.execute(`DELETE FROM film_videos WHERE film_id = ?`, [filmId]);

  for (const [i, img] of input.gallery.entries()) {
    await conn.execute(
      `INSERT INTO film_gallery (film_id, image_url, caption, sort_order) VALUES (?, ?, ?, ?)`,
      [filmId, img.imageUrl, img.caption || null, i],
    );
  }
  for (const [i, vid] of input.videos.entries()) {
    await conn.execute(
      `INSERT INTO film_videos (film_id, video_url, title, sort_order) VALUES (?, ?, ?, ?)`,
      [filmId, vid.videoUrl, vid.title || null, i],
    );
  }
}

export async function createFilm(input: FilmInput): Promise<number> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO films
        (slug, title, project_type, official_role, genre, language, year, credits, synopsis,
         poster_url, status, featured, featured_order, sort_order, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.slug,
        input.title,
        input.projectType,
        input.officialRole,
        input.genre,
        input.language,
        input.year || null,
        input.credits,
        input.synopsis || null,
        input.posterUrl || null,
        input.status,
        input.featured ? 1 : 0,
        input.featuredOrder,
        input.sortOrder,
        input.seoTitle || null,
        input.seoDescription || null,
      ],
    );
    const filmId = result.insertId;
    await replaceGalleryAndVideos(conn, filmId, input);
    await conn.commit();
    return filmId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateFilm(id: number, input: FilmInput): Promise<void> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE films SET
        slug = ?, title = ?, project_type = ?, official_role = ?, genre = ?, language = ?, year = ?,
        credits = ?, synopsis = ?, poster_url = ?, status = ?, featured = ?,
        featured_order = ?, sort_order = ?, seo_title = ?, seo_description = ?
       WHERE id = ?`,
      [
        input.slug,
        input.title,
        input.projectType,
        input.officialRole,
        input.genre,
        input.language,
        input.year || null,
        input.credits,
        input.synopsis || null,
        input.posterUrl || null,
        input.status,
        input.featured ? 1 : 0,
        input.featuredOrder,
        input.sortOrder,
        input.seoTitle || null,
        input.seoDescription || null,
        id,
      ],
    );
    await replaceGalleryAndVideos(conn, id, input);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function archiveFilm(id: number): Promise<void> {
  const pool = getPool();
  await pool.execute(`UPDATE films SET status = 'ARCHIVED' WHERE id = ?`, [id]);
}
