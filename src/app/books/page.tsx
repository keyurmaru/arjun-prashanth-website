import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookGrid from "@/components/BookGrid";
import CTASection from "@/components/CTASection";
import { books } from "@/content/books";
import { buildMetadata } from "@/lib/seo";

const title = "Books";
const description = "Books by Arjun Prashanth — including the literary crime novel The Line That Holds.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/books" });

export default function BooksPage() {
  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-20 lg:pb-28 border-b border-near-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Books" }]} />
          <Reveal>
            <SectionHeading as="h1" eyebrow="Author" title="Books by Arjun Prashanth" tone="ivory" />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <BookGrid books={books} />
          </Reveal>
        </div>
      </section>

      <CTASection
        tone="ivory"
        eyebrow="Publishing / Literary"
        title="Interested in publishing, media or a literary collaboration?"
        ctaLabel="Get in Touch"
        ctaHref="/contact"
      />
    </div>
  );
}
