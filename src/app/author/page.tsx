import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { getBookBySlug } from "@/content/books";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

const title = "Author";
const description = "Arjun Prashanth Rao — Author. Stories that stay long after the last page.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/author" });

export default function AuthorPage() {
  const featured = getBookBySlug("the-line-that-holds")!;

  return (
    <div className="bg-dark-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          jobTitle: "Author",
          url: "https://arjunprashanth.com/author",
        }}
      />

      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Author" }]} />
          <Reveal>
            <SectionHeading as="h1" eyebrow="Arjun Prashanth" title="Stories that stay long after the last page." />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <div className="font-inter text-[15px] leading-relaxed text-muted max-w-2xl space-y-5">
              <p>
                Arjun Prashanth became an author because not every story he imagined belonged on a film set. Over
                years of writing for cinema, he accumulated ideas, characters and emotional worlds that demanded a
                different form — one that allowed more interiority, silence, psychological detail and time.
              </p>
              <p>
                His published novel The Line That Holds is a literary crime story built around truth, institutional
                silence, corruption, memory and moral courage. His next book, Rain Held, moves into a different
                emotional territory: a contemporary love story centred on memory, longing, emotional vulnerability
                and the things people are unable to say when love changes shape.
              </p>
              <p>
                As both filmmaker and author, Arjun sees the two disciplines as complementary. Cinema gives him
                movement, performance, image and sound; fiction gives him interiority, memory and silence. His aim is
                to build a body of work in which each story finds the form it deserves.
              </p>
              <Link href="/books" className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors mt-2">
                Explore Books →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800 bg-ivory-100 text-near-black">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-[280px_1fr] gap-14 items-center">
          <Reveal variant="left">
            <div className="relative aspect-[2/3] w-full max-w-xs">
              <Image src={featured.cover} alt={`${featured.title} — book cover`} fill sizes="280px" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze mb-3">Featured Published Work</p>
            <h2 className="font-cormorant font-medium text-near-black" style={{ fontSize: "clamp(1.9rem, 4vw, 2.5rem)" }}>
              {featured.title}
            </h2>
            <p className="font-inter text-[13px] text-near-black/70 mt-2">By Arjun Prashanth · Genre: {featured.genre}</p>
            <Link
              href="/books"
              className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase px-7 py-3 border border-near-black/30 text-near-black hover:border-bronze hover:text-bronze transition-colors mt-7"
            >
              View Books Page
            </Link>
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow="Publishing / Literary"
        title="Interested in publishing, media or a literary collaboration?"
        ctaLabel="Get in Touch"
        ctaHref="/contact"
      />
    </div>
  );
}
