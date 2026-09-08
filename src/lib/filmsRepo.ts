import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export type FilmStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProjectType = "Feature Film" | "Short Film" | "Direction" | "Associate Direction" | "Assistant Direction" | "Editing";

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
  trailerUrl: string | null;
  posterUrl: string | null;
  status: FilmStatus;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

function hydrateFilm(row: RowDataPacket): FilmRecord {
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
    trailerUrl: row.trailer_url,
    posterUrl: row.poster_url,
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
  return rows.map(hydrateFilm);
}

export async function getFeaturedFilmsPublic(limit = 4): Promise<FilmRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM films WHERE status = 'PUBLISHED' AND featured = 1
     ORDER BY featured_order ASC, sort_order ASC LIMIT ?`,
    [limit],
  );
  const featured = rows.map(hydrateFilm);
  if (featured.length > 0) return featured;

  // Fallback per the CMS doc's featured algorithm: if nothing is
  // explicitly featured, fall back to latest published rather than
  // showing an empty homepage section.
  const [fallbackRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM films WHERE status = 'PUBLISHED' ORDER BY sort_order ASC, created_at DESC LIMIT ?`,
    [limit],
  );
  return fallbackRows.map(hydrateFilm);
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
  return rows.map(hydrateFilm);
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
  trailerUrl?: string;
  posterUrl?: string;
  status: FilmStatus;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export async function createFilm(input: FilmInput): Promise<number> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO films
      (slug, title, project_type, official_role, genre, language, year, credits, synopsis, trailer_url,
       poster_url, status, featured, featured_order, sort_order, seo_title, seo_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      input.trailerUrl || null,
      input.posterUrl || null,
      input.status,
      input.featured ? 1 : 0,
      input.featuredOrder,
      input.sortOrder,
      input.seoTitle || null,
      input.seoDescription || null,
    ],
  );
  return result.insertId;
}

export async function updateFilm(id: number, input: FilmInput): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `UPDATE films SET
      slug = ?, title = ?, project_type = ?, official_role = ?, genre = ?, language = ?, year = ?,
      credits = ?, synopsis = ?, trailer_url = ?, poster_url = ?, status = ?, featured = ?,
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
      input.trailerUrl || null,
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
}

export async function archiveFilm(id: number): Promise<void> {
  const pool = getPool();
  await pool.execute(`UPDATE films SET status = 'ARCHIVED' WHERE id = ?`, [id]);
}
