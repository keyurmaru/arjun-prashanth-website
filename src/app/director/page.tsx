import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import FilmGrid from "@/components/FilmGrid";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { films } from "@/content/films";
import { storyWorlds } from "@/content/site";
import { buildMetadata, siteUrl } from "@/lib/seo";

const title = "Director";
const description =
  "Arjun Prashanth Rao — Film Director. Direction rooted in the emotional and psychological truth of a scene, built across Telugu and Hindi cinema.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/director" });

export default function DirectorPage() {
  return (
    <div className="bg-dark-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Director", item: `${siteUrl}/director` },
          ],
        }}
      />

      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Director" }]} />
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow="Film Director"
              title="Stories are written on paper. Cinema begins when they acquire a pulse."
            />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-[1fr_1.1fr] gap-14">
          <Reveal variant="left">
            <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze mb-4">Background</p>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-inter text-[15px] leading-relaxed text-muted space-y-5">
              <p>
                Arjun approaches direction from the emotional and psychological truth of a scene. Before deciding how
                the camera moves, the central question is what each character wants, what they are hiding, and what
                changes between the beginning and end of the moment.
              </p>
              <p>
                Arjun Prashanth&rsquo;s relationship with storytelling began long before he entered the film industry.
                From childhood, he was drawn to writing, imagination and creative work. Even while building a
                conventional professional career in IT and the corporate world, he continued to write stories
                privately and remained emotionally connected to cinema.
              </p>
              <p>
                After becoming financially independent, he made a decisive career shift: he left a corporate career,
                moved to the United Kingdom and deepened his understanding of human behaviour and storytelling through
                postgraduate study — an MS in Psychology at the University of Bedfordshire, and postgraduate
                filmmaking training at the National Film and Television School (NFTS), UK.
              </p>
              <p>
                After returning to India, he began building his film career from the ground up, working across
                Telugu and Hindi film productions and progressing from assistant direction to associate direction
                while developing his own voice as a writer-director. He has also contributed to screenwriting on
                selected projects and continues to write original stories and screenplays for films he intends to
                direct.
              </p>
              <blockquote className="font-cormorant italic text-xl text-bronze-light border-l-2 border-bronze/50 pl-6 py-1">
                &ldquo;I believe cinema should make the audience feel before it asks them to analyse. A film must
                create tension, curiosity, fear, empathy, love, anger or grief in a way that is immediate and
                cinematic.&rdquo;
              </blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <SectionHeading eyebrow="The Directorial Approach" title="Primary Story Worlds" />
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
              {storyWorlds.map((w) => (
                <li key={w} className="font-inter text-[13px] text-muted border-l-2 border-bronze/40 pl-4 py-1">
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
              <SectionHeading eyebrow="Selected Work" title="Director & Assistant Director Credits" />
              <Link href="/films" className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors">
                View All Films →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <FilmGrid films={films} />
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow="Collaboration"
        title="Have a project, role or collaboration in mind?"
        ctaLabel="Discuss a Film"
        ctaHref="/contact"
      />
    </div>
  );
}
