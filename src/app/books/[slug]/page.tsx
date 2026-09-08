import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import BookPurchaseBox from "@/components/BookPurchaseBox";
import { getBookPublicBySlug } from "@/lib/booksRepo";
import { buildMetadata, siteUrl } from "@/lib/seo";

// Books are DB-backed and can change independently of a deploy — this page
// is intentionally dynamic (no generateStaticParams) rather than statically
// generated at build time, and the DB is only reachable from the live
// server, not the GitHub Actions build runner.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookPublicBySlug(slug);
  if (!book) return buildMetadata({ title: "Book Not Found", description: "", path: `/books/${slug}` });
  return {
    ...buildMetadata({
      title: book.seoTitle || book.title,
      description: book.seoDescription || book.excerpt,
      path: `/books/${book.slug}`,
      image: book.cover,
    }),
  };
}

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookPublicBySlug(slug);
  if (!book) notFound();

  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          author: { "@type": "Person", name: "Arjun Prashanth" },
          genre: book.genre,
          image: book.cover,
          ...(book.status === "PUBLISHED" && book.variants.length > 0
            ? {
                offers: book.variants.map((v) => ({
                  "@type": "Offer",
                  price: v.priceINR,
                  priceCurrency: "INR",
                  availability: "https://schema.org/InStock",
                  url: `${siteUrl}/books/${book.slug}`,
                })),
              }
            : {}),
        }}
      />

      <section className="pt-40 pb-16 border-b border-near-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Books", href: "/books" }, { label: book.title }]} />
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20 grid lg:grid-cols-[360px_1fr] gap-14">
          <Reveal variant="left">
            <div className="relative aspect-[2/3] w-full max-w-sm">
              <Image
                src={book.cover}
                alt={`${book.title} — book cover`}
                fill
                sizes="(min-width: 1024px) 360px, 80vw"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-cormorant font-medium text-near-black" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}>
              {book.title}
            </h1>
            <p className="font-inter text-[12px] tracking-[0.1em] uppercase text-bronze mt-4">{book.genre}</p>
            <p className="font-inter text-[13px] text-near-black/60 mt-1">By Arjun Prashanth</p>

            <p className="font-inter text-[15px] leading-relaxed text-near-black/80 mt-8 max-w-xl">{book.excerpt}</p>

            {book.description.map((p, i) => (
              <p key={i} className="font-inter text-[15px] leading-relaxed text-near-black/70 mt-5 max-w-xl">
                {p}
              </p>
            ))}

            {book.discover && (
              <ul className="grid sm:grid-cols-2 gap-3 mt-8 max-w-xl">
                {book.discover.map((d) => (
                  <li key={d} className="font-inter text-[13px] text-near-black/70 border-l-2 border-bronze/50 pl-4 py-0.5">
                    {d}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10">
              <BookPurchaseBox book={book} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
