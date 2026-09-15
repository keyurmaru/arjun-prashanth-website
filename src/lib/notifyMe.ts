import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { sendMail } from "@/lib/mailer";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/seo";

/** Emails everyone who signed up for "Notify Me" on this book, then clears
 * their signups — one-time notification, not a recurring list. Called from
 * the admin book-update route when a book's status transitions into
 * PUBLISHED from anything else (covers both "coming soon went live" and
 * "back in stock" restock cases). Never throws — a mail failure here
 * shouldn't block the book save that triggered it. */
export async function notifyBookAvailable(bookId: number, bookTitle: string, bookSlug: string): Promise<void> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT id, email FROM notify_me WHERE book_id = ?`, [bookId]);
  if (rows.length === 0) return;

  const url = `${siteUrl}/books/${bookSlug}`;
  const text = [
    `Good news — "${bookTitle}" is now available to order.`,
    ``,
    url,
    ``,
    `— ${site.name}`,
  ].join("\n");

  for (const row of rows) {
    try {
      await sendMail({ to: row.email, subject: `${bookTitle} is now available`, text });
    } catch (err) {
      console.error(`[notifyMe] Failed to notify ${row.email} for book #${bookId}:`, err);
    }
  }

  await pool.execute(`DELETE FROM notify_me WHERE book_id = ?`, [bookId]);
}
