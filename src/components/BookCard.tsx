import Image from "next/image";
import Link from "next/link";
import type { BookRecord } from "@/lib/booksRepo";

const STATUS_LABELS: Partial<Record<BookRecord["status"], string>> = {
  COMING_SOON: "Coming Soon",
  PRE_ORDER: "Pre-Order",
  OUT_OF_STOCK: "Out of Stock",
};

export default function BookCard({ book }: { book: BookRecord }) {
  const statusLabel = STATUS_LABELS[book.status];
  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-dark-800 border border-dark-800 group-hover:border-bronze/50 transition-colors duration-300">
        <Image
          src={book.cover}
          alt={`${book.title} — book cover`}
          fill
          sizes="(min-width: 1024px) 320px, 45vw"
          className="object-cover"
        />
        {statusLabel && (
          <div className="absolute top-3 right-3 bg-dark-950/90 border border-bronze/60 px-3 py-1">
            <span className="font-inter text-[9px] tracking-[0.16em] uppercase text-bronze-light">{statusLabel}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="font-cormorant text-xl text-ivory-100 group-hover:text-bronze-light transition-colors">{book.title}</p>
        <p className="font-inter text-[11px] tracking-[0.08em] uppercase text-muted mt-1">{book.genre}</p>
      </div>
    </Link>
  );
}
