import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import FilmGrid from "@/components/FilmGrid";
import BookGrid from "@/components/BookGrid";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { films } from "@/content/films";
import { getPublishedBooksPublic } from "@/lib/booksRepo";
import { site, storyWorlds, aboutMilestones } from "@/content/site";
import { buildMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
  path: "/",
});

export default async function HomePage() {
  const featuredFilms = films.slice(0, 4);
  const featuredBooks = await getPublishedBooksPublic();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          jobTitle: ["Film Director", "Screenwriter", "Editor", "Author"],
          url: siteUrl,
          sameAs: [site.instagram],
        }}
      />

      {/* 1. Hero */}
      <section className="relative h-screen min-h-[640px] flex items-end overflow-hidden bg-dark-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/gallery/photo-50.jpeg"
            alt="Arjun Prashanth Rao on set"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "62% 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/65 to-dark-950/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 lg:pb-28 pt-40 w-full">
          <Reveal>
            <p className="font-inter text-[11px] tracking-[0.25em] uppercase text-bronze mb-6">
              Film Director · Screenwriter · Editor · Author
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="font-cormorant font-medium text-ivory-100 leading-[0.95]"
              style={{ fontSize: "clamp(2.75rem, 8vw, 6.5rem)" }}
            >
              Arjun
              <br />
              Prashanth Rao
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="font-cormorant italic text-bronze-light mt-6 max-w-xl" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}>
              &ldquo;{site.tagline}&rdquo;
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="flex flex-wrap items-center gap-4 mt-11">
              <Link
                href="/films"
                className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-bronze text-dark-950 hover:bg-bronze-light transition-colors duration-300"
              >
                Explore Film Work
              </Link>
              <Link
                href="/contact"
                className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 border border-ivory-100/40 text-ivory-100 hover:border-bronze hover:text-bronze transition-colors duration-300"
              >
                Discuss a Story
              </Link>
              <Link
                href="/books"
                className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 text-ivory-100/70 hover:text-ivory-100 transition-colors duration-300"
              >
                Explore Books →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <p className="font-inter text-[10px] tracking-[0.14em] uppercase text-ivory-100/50 mt-8">Showreel — Coming Soon</p>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60">
          <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-ivory-100">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-ivory-100 to-transparent" />
        </div>
      </section>

      {/* 2. Director profile */}
      <section className="bg-dark-950 border-t border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-[1fr_1.1fr] gap-14 items-start">
          <Reveal variant="left">
            <SectionHeading
              eyebrow="Director"
              title="Direction rooted in emotional and psychological truth."
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="font-inter text-[15px] leading-relaxed text-muted space-y-5">
              <p>
                Arjun approaches direction from the emotional and psychological truth of a scene. Before deciding how
                the camera moves, the central question is what each character wants, what they are hiding, and what
                changes between the beginning and end of the moment.
              </p>
              <p>
                Formally trained in filmmaking in the United Kingdom, he built his film career from the ground up
                across Telugu and Hindi productions, progressing from assistant direction to associate direction
                while developing his own voice as a writer-director.
              </p>
              <Link href="/director" className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors mt-2">
                Read the Full Profile →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Featured work */}
      <section className="bg-dark-950 border-t border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
              <SectionHeading eyebrow="Selected Work" title="Featured Film Credits" />
              <Link href="/films" className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors">
                View All Films →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <FilmGrid films={featuredFilms} />
          </Reveal>
        </div>
      </section>

      {/* 4. Screenwriting */}
      <section className="bg-dark-900 border-t border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal variant="left">
            <SectionHeading
              eyebrow="Screenwriting"
              title="Stories written for the screen. Built to be felt before they are filmed."
              description="Arjun develops screen stories from character, desire, contradiction and consequence — feature films, story development, and long-form series."
            />
            <Link href="/screenwriting" className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors mt-7">
              Discuss a Story →
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid grid-cols-2 gap-4">
              {storyWorlds.map((w) => (
                <li key={w} className="font-inter text-[13px] text-muted border-l-2 border-bronze/40 pl-4 py-1">
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 5. Editing */}
      <section className="bg-dark-950 border-t border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">
          <Reveal variant="left">
            <SectionHeading eyebrow="Editing" title="A craft built alongside direction and story." />
          </Reveal>
          <Reveal delay={100}>
            <p className="font-inter text-[15px] leading-relaxed text-muted max-w-xl">
              Arjun&rsquo;s formal training and film experience developed a foundation across direction, screenwriting,
              editing and visual storytelling — a craft he continues to apply on his own projects.
            </p>
            <Link href="/editing" className="inline-block font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors mt-6">
              Explore Editing →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 6. Books */}
      <section className="bg-ivory-100 text-near-black">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
              <SectionHeading eyebrow="Author" title="Books by Arjun Prashanth" tone="ivory" />
              <Link href="/books" className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-near-black transition-colors">
                Explore Books →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <BookGrid books={featuredBooks} />
          </Reveal>
        </div>
      </section>

      {/* 7. Credentials */}
      <section className="bg-dark-950 border-t border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <SectionHeading eyebrow="Credentials" title="Milestones" align="center" />
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 max-w-4xl mx-auto">
              {aboutMilestones.map((m) => (
                <li key={m} className="font-inter text-[13px] text-muted border-t border-dark-800 pt-4">
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 8. Press / Media — "Selected Coverage" */}
      <section className="bg-ivory-100 text-near-black border-t border-dark-800/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <p className="font-inter text-[11px] tracking-[0.2em] uppercase text-bronze mb-4">Press &amp; Media</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-cormorant font-medium text-near-black mb-14" style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)" }}>
              Selected Coverage
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="border-t border-dark-800/15">
              <div className="flex flex-col items-center text-center border-b border-dark-800/15 py-16 gap-2">
                <p className="font-cormorant text-2xl text-near-black">Press Coverage — Coming Soon</p>
                <p className="font-inter text-[13px] text-near-black/60 max-w-md">
                  Verified interviews, articles and features will be published here as they become available.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <Link
              href="/press"
              className="inline-flex items-center gap-2 mt-8 font-inter text-[11px] tracking-[0.16em] uppercase text-near-black/70 hover:text-bronze transition-colors group"
            >
              Visit Press Page
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 9. Contact CTA */}
      <CTASection
        eyebrow="Get In Touch"
        title="Have a project, role or collaboration in mind?"
        ctaLabel="Work With Me"
        ctaHref="/contact"
      />
    </>
  );
}
