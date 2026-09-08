export interface BookVariant {
  format: string;
  priceINR: number;
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
  /** Real, currently-live purchase page — the new site does not yet have its
   * own checkout wired to Razorpay, so "Buy Book" is honest and routes to the
   * store that actually processes the order today. */
  purchaseUrl?: string;
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
      { format: "Paperback", priceINR: 649 },
      { format: "Hardcover", priceINR: 850 },
    ],
    purchaseUrl: "https://arjunprashanth.com/product/the-line-that-holds-hardcover-paperback/",
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
