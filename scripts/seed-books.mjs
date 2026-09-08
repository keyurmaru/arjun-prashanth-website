// One-time seed of the two verified books (previously the static source of
// truth in src/content/books.ts, now superseded by the books/book_variants
// tables) into the database. Safe to re-run — skips a slug that already
// exists rather than duplicating it.
//
// Run from the project root with DB_* env vars set:
//   DB_HOST=127.0.0.1 DB_NAME=... DB_USER=... DB_PASSWORD=... node scripts/seed-books.mjs

import mysql from "mysql2/promise";

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error("Set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in the environment first.");
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

// Verified from the live WooCommerce catalogue — see src/content/books.ts
// (kept as historical reference; no longer imported by the app at runtime).
const books = [
  {
    slug: "the-line-that-holds",
    title: "The Line That Holds",
    genre: "Literary Crime",
    status: "PUBLISHED",
    cover: "/images/books/the-line-that-holds.jpeg",
    excerpt:
      "A character-driven literary crime novel set substantially in Hyderabad, following police officer Arjun Vedanta Rao as he investigates missing records, altered reports, and unanswered questions surrounding his father's past.",
    description: [
      "The Line That Holds combines investigative crime with psychological tension, family drama, institutional conflict, and moral dilemmas. At its centre is Arjun's investigation into a past that has been obscured by missing records and altered reports.",
      "The investigation connects Arjun to the legacy of his father, Vedanta Rao, a principled police officer whose refusal to compromise his conscience carries consequences long after his death. As the buried details begin to emerge, Arjun discovers that corruption can exist within the very systems established to uphold justice.",
      "Alongside the investigation, the novel examines the effects of silence on individuals and families. Arjun's relationship with Katyayani Iyer adds another personal dimension to the search for truth, while the story raises difficult questions about institutional power, loyalty, memory, and moral courage.",
    ],
    discover: [
      "Arjun Vedanta Rao's investigation into his father's mysterious past.",
      "Missing records and altered reports that conceal important truths.",
      "The legacy of Vedanta Rao, a police officer guided by conscience.",
      "A network of corruption within institutions meant to uphold justice.",
      "Katyayani Iyer's connection to the consequences of buried truths.",
      "The conflict between institutional loyalty and the pursuit of justice.",
    ],
    sortOrder: 0,
    variants: [
      { format: "Paperback", priceINR: 649, stock: 25, lowStockThreshold: 5, weightGrams: 300, length: 20, breadth: 14, height: 2 },
      { format: "Hardcover", priceINR: 850, stock: 15, lowStockThreshold: 5, weightGrams: 450, length: 22, breadth: 15, height: 3 },
    ],
  },
  {
    slug: "rain-held",
    title: "Rain Held",
    genre: "Contemporary Love Story",
    status: "COMING_SOON",
    cover: "/images/books/rain-held.jpeg",
    excerpt:
      "A contemporary love story centred on memory, longing, emotional vulnerability, and the things people are unable to say when love changes shape.",
    description: [
      "Rain Held moves into a different emotional territory from The Line That Holds: a contemporary love story about memory, longing, emotional vulnerability, and the things people are unable to say when love changes shape.",
    ],
    discover: [],
    sortOrder: 1,
    variants: [],
  },
];

for (const book of books) {
  const [existing] = await pool.execute("SELECT id FROM books WHERE slug = ?", [book.slug]);
  if (existing.length > 0) {
    console.log(`Skipping "${book.slug}" — already exists.`);
    continue;
  }

  const [result] = await pool.execute(
    `INSERT INTO books
      (slug, title, genre, status, cover, excerpt, description_json, discover_json, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.slug,
      book.title,
      book.genre,
      book.status,
      book.cover,
      book.excerpt,
      JSON.stringify(book.description),
      JSON.stringify(book.discover),
      book.sortOrder,
    ],
  );
  const bookId = result.insertId;

  for (const v of book.variants) {
    await pool.execute(
      `INSERT INTO book_variants
        (book_id, format, price_inr, stock, low_stock_threshold, weight_grams, length_cm, breadth_cm, height_cm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookId, v.format, v.priceINR, v.stock, v.lowStockThreshold, v.weightGrams, v.length, v.breadth, v.height],
    );
  }

  console.log(`Inserted "${book.slug}" (id ${bookId}) with ${book.variants.length} variant(s).`);
}

await pool.end();
