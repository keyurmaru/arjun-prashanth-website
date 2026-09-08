// Historical reference only — the public site and checkout now read books
// from the database (see src/lib/booksRepo.ts and scripts/seed-books.mjs,
// which seeded this exact verified data). Nothing at runtime imports this
// file anymore; it's kept so the original verified WooCommerce-sourced
// content isn't lost.

export interface BookVariant {
  format: string;
  priceINR: number;
  /** Shipping package data for Shiprocket order creation — typical values
   * for this format, not a precise per-copy measurement. Adjust if actual
   * packed weight/dimensions differ. */
  weightGrams: number;
  dimensionsCm: { length: number; breadth: number; height: number };
}

export interface Book {
  slug: string;
  title: string;
  genre: string;
  status: "published" | "coming-soon";
  cover: string;
  excerpt: string;
  description: string[];
  discover?: string[];
  variants?: BookVariant[];
}

// Verified from the live WooCommerce catalogue (product post type + meta).
// "Rain Held" is confirmed Coming Soon in the source data — no price, no
// purchase action, per the no-fake-commerce rule.
export const books: Book[] = [
  {
    slug: "the-line-that-holds",
    title: "The Line That Holds",
    genre: "Literary Crime",
    status: "published",
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
    variants: [
      { format: "Paperback", priceINR: 649, weightGrams: 300, dimensionsCm: { length: 20, breadth: 14, height: 2 } },
      { format: "Hardcover", priceINR: 850, weightGrams: 450, dimensionsCm: { length: 22, breadth: 15, height: 3 } },
    ],
  },
  {
    slug: "rain-held",
    title: "Rain Held",
    genre: "Contemporary Love Story",
    status: "coming-soon",
    cover: "/images/books/rain-held.jpeg",
    excerpt:
      "A contemporary love story centred on memory, longing, emotional vulnerability, and the things people are unable to say when love changes shape.",
    description: [
      "Rain Held moves into a different emotional territory from The Line That Holds: a contemporary love story about memory, longing, emotional vulnerability, and the things people are unable to say when love changes shape.",
    ],
  },
];

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

/** Server-side price/shipping lookup for a cart line item. Never trust a
 * client-submitted price — always resolve it from this catalogue. */
export function getPurchasableVariant(
  bookSlug: string,
  format: string,
): { book: Book; variant: BookVariant } | undefined {
  const book = getBookBySlug(bookSlug);
  if (!book || book.status !== "published" || !book.variants) return undefined;
  const variant = book.variants.find((v) => v.format === format);
  if (!variant) return undefined;
  return { book, variant };
}
