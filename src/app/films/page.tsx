import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import FilmGrid from "@/components/FilmGrid";
import CTASection from "@/components/CTASection";
import { films } from "@/content/films";
import { buildMetadata } from "@/lib/seo";

const title = "Films";
const description =
  "Film credits of Arjun Prashanth Rao across Telugu and Hindi cinema, from assistant direction to associate direction and his directorial debut short, Vidhatri.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/films" });

export default function FilmsPage() {
  return (
    <div className="bg-dark-950">
      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Films" }]} />
          <Reveal>
            <SectionHeading as="h1" eyebrow="Filmography" title="Films" description={description} />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
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
