import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";

export type BookStatus = "DRAFT" | "COMING_SOON" | "PRE_ORDER" | "PUBLISHED" | "OUT_OF_STOCK" | "ARCHIVED";

export interface BookVariantRecord {
  id: number;
  format: string;
  sku: string | null;
  priceINR: number;
  stock: number;
  lowStockThreshold: number;
  weightGrams: number;
  dimensionsCm: { length: number; breadth: number; height: number };
}

export interface BookRecord {
  id: number;
  slug: string;
  title: string;
  genre: string;
  status: BookStatus;
  cover: string;
  excerpt: string;
  description: string[];
  discover: string[] | null;
  signedCopyAvailable: boolean;
  personalisationAvailable: boolean;
  personalisationCharLimit: number;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  variants: BookVariantRecord[];
}

// Statuses visible to public listing/detail pages. DRAFT and ARCHIVED never
// reach the public site regardless of how they're linked to.
const PUBLIC_STATUSES: BookStatus[] = ["COMING_SOON", "PRE_ORDER", "PUBLISHED", "OUT_OF_STOCK"];

async function hydrateBook(row: RowDataPacket): Promise<BookRecord> {
  const pool = getPool();
  const [variantRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM book_variants WHERE book_id = ? ORDER BY price_inr ASC`,
    [row.id],
  );
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    genre: row.genre,
    status: row.status,
    cover: row.cover,
    excerpt: row.excerpt,
    description: typeof row.description_json === "string" ? JSON.parse(row.description_json) : row.description_json,
    discover: row.discover_json
      ? typeof row.discover_json === "string"
        ? JSON.parse(row.discover_json)
        : row.discover_json
      : null,
    signedCopyAvailable: !!row.signed_copy_available,
    personalisationAvailable: !!row.personalisation_available,
    personalisationCharLimit: row.personalisation_char_limit,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    variants: variantRows.map((v) => ({
      id: v.id,
      format: v.format,
      sku: v.sku,
      priceINR: v.price_inr,
      stock: v.stock,
      lowStockThreshold: v.low_stock_threshold,
      weightGrams: v.weight_grams,
      dimensionsCm: { length: v.length_cm, breadth: v.breadth_cm, height: v.height_cm },
    })),
  };
}

// ---- Public reads ----

export async function getPublishedBooksPublic(): Promise<BookRecord[]> {
  const pool = getPool();
  const placeholders = PUBLIC_STATUSES.map(() => "?").join(",");
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM books WHERE status IN (${placeholders}) ORDER BY sort_order ASC, created_at DESC`,
    PUBLIC_STATUSES,
  );
  return Promise.all(rows.map(hydrateBook));
}

export async function getBookPublicBySlug(slug: string): Promise<BookRecord | null> {
  const pool = getPool();
  const placeholders = PUBLIC_STATUSES.map(() => "?").join(",");
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM books WHERE slug = ? AND status IN (${placeholders})`,
    [slug, ...PUBLIC_STATUSES],
  );
  return rows[0] ? hydrateBook(rows[0]) : null;
}

/** Server-side price/shipping/stock lookup for a cart line — the only place
 * checkout may trust a price from. Only PUBLISHED books with in-stock
 * variants are purchasable; COMING_SOON/PRE_ORDER/OUT_OF_STOCK/DRAFT/ARCHIVED
 * never resolve here regardless of what the client sends. */
export async function getPurchasableVariant(
  bookSlug: string,
  format: string,
): Promise<{ book: BookRecord; variant: BookVariantRecord } | null> {
  const book = await getBookPublicBySlug(bookSlug);
  if (!book || book.status !== "PUBLISHED") return null;
  const variant = book.variants.find((v) => v.format === format);
  if (!variant || variant.stock <= 0) return null;
  return { book, variant };
}

/** Atomically decrements stock, failing (returns false) if not enough is
 * left — the guard against overselling when two checkouts race for the
 * last copy. Must be called only once per paid order (see fulfillOrder.ts's
 * idempotent markOrderPaid gate). */
export async function decrementStock(variantId: number, quantity: number): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE book_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`,
    [quantity, variantId, quantity],
  );
  return result.affectedRows > 0;
}

/** Inverse of decrementStock — used when cancelling an already-paid order,
 * so a cancellation doesn't permanently lose that stock. variant_id can be
 * null on an order_items row if the variant was later deleted; callers
 * should skip those (nothing to restore to). */
export async function restoreStock(variantId: number, quantity: number): Promise<void> {
  const pool = getPool();
  await pool.execute(`UPDATE book_variants SET stock = stock + ? WHERE id = ?`, [quantity, variantId]);
}

export async function findVariantId(bookSlug: string, format: string): Promise<number | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT bv.id FROM book_variants bv JOIN books b ON b.id = bv.book_id WHERE b.slug = ? AND bv.format = ?`,
    [bookSlug, format],
  );
  return rows[0]?.id ?? null;
}

// ---- Admin reads/writes ----

export async function listBooksAdmin(): Promise<BookRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM books ORDER BY sort_order ASC, created_at DESC`);
  return Promise.all(rows.map(hydrateBook));
}

export async function getBookAdminById(id: number): Promise<BookRecord | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM books WHERE id = ?`, [id]);
  return rows[0] ? hydrateBook(rows[0]) : null;
}

export interface BookInput {
  slug: string;
  title: string;
  genre: string;
  status: BookStatus;
  cover: string;
  excerpt: string;
  description: string[];
  discover?: string[];
  signedCopyAvailable: boolean;
  personalisationAvailable: boolean;
  personalisationCharLimit: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  variants: {
    id?: number;
    format: string;
    sku?: string;
    priceINR: number;
    stock: number;
    lowStockThreshold: number;
    weightGrams: number;
    dimensionsCm: { length: number; breadth: number; height: number };
  }[];
}

export async function createBook(input: BookInput): Promise<number> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO books
        (slug, title, genre, status, cover, excerpt, description_json, discover_json,
         signed_copy_available, personalisation_available, personalisation_char_limit,
         sort_order, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.slug,
        input.title,
        input.genre,
        input.status,
        input.cover,
        input.excerpt,
        JSON.stringify(input.description),
        input.discover ? JSON.stringify(input.discover) : null,
        input.signedCopyAvailable ? 1 : 0,
        input.personalisationAvailable ? 1 : 0,
        input.personalisationCharLimit,
        input.sortOrder,
        input.seoTitle || null,
        input.seoDescription || null,
      ],
    );
    const bookId = result.insertId;
    await insertVariants(conn, bookId, input.variants);
    await conn.commit();
    return bookId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateBook(id: number, input: BookInput): Promise<void> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE books SET
        slug = ?, title = ?, genre = ?, status = ?, cover = ?, excerpt = ?, description_json = ?, discover_json = ?,
        signed_copy_available = ?, personalisation_available = ?, personalisation_char_limit = ?,
        sort_order = ?, seo_title = ?, seo_description = ?
       WHERE id = ?`,
      [
        input.slug,
        input.title,
        input.genre,
        input.status,
        input.cover,
        input.excerpt,
        JSON.stringify(input.description),
        input.discover ? JSON.stringify(input.discover) : null,
        input.signedCopyAvailable ? 1 : 0,
        input.personalisationAvailable ? 1 : 0,
        input.personalisationCharLimit,
        input.sortOrder,
        input.seoTitle || null,
        input.seoDescription || null,
        id,
      ],
    );
    // Simplest correct approach for a small variant list: replace wholesale
    // rather than diffing updates/inserts/deletes.
    await conn.execute(`DELETE FROM book_variants WHERE book_id = ?`, [id]);
    await insertVariants(conn, id, input.variants);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function insertVariants(conn: PoolConnection, bookId: number, variants: BookInput["variants"]): Promise<void> {
  for (const v of variants) {
    await conn.execute(
      `INSERT INTO book_variants
        (book_id, format, sku, price_inr, stock, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookId,
        v.format,
        v.sku || null,
        v.priceINR,
        v.stock,
        v.lowStockThreshold,
        v.weightGrams,
        v.dimensionsCm.length,
        v.dimensionsCm.breadth,
        v.dimensionsCm.height,
      ],
    );
  }
}

export async function archiveBook(id: number): Promise<void> {
  const pool = getPool();
  await pool.execute(`UPDATE books SET status = 'ARCHIVED' WHERE id = ?`, [id]);
}

export interface LowStockVariant {
  bookTitle: string;
  format: string;
  stock: number;
  lowStockThreshold: number;
}

export async function getLowStockVariants(): Promise<LowStockVariant[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT b.title as book_title, bv.format, bv.stock, bv.low_stock_threshold
     FROM book_variants bv JOIN books b ON b.id = bv.book_id
     WHERE bv.stock <= bv.low_stock_threshold AND b.status NOT IN ('ARCHIVED', 'DRAFT')
     ORDER BY bv.stock ASC`,
  );
  return rows.map((r) => ({
    bookTitle: r.book_title,
    format: r.format,
    stock: r.stock,
    lowStockThreshold: r.low_stock_threshold,
  }));
}
