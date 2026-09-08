import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import { buildMetadata } from "@/lib/seo";

const title = "Editing";
const description =
  "Arjun Prashanth's editing practice — a craft built alongside direction, screenwriting and visual storytelling.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/editing" });

export default function EditingPage() {
  return (
    <div className="bg-dark-950">
      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Editing" }]} />
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow="Editing"
              title="A craft built alongside direction and story."
              description="Formal training and film experience across Telugu and Hindi productions developed a foundation across direction, screenwriting, editing and visual storytelling — a craft Arjun continues to apply on his own projects."
            />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <SectionHeading eyebrow="Editing Credits" title="Selected Editing Projects" />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-12 border border-dark-800 px-8 py-16 text-center max-w-2xl mx-auto">
              <p className="font-cormorant text-2xl text-ivory-100">Editing Credits — Coming Soon</p>
              <p className="font-inter text-[13px] text-muted mt-4">
                Verified editing project credits and material will be published here as they are confirmed.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow="Collaboration"
        title="Have an editing project in mind?"
        ctaLabel="Get in Touch"
        ctaHref="/contact"
      />
    </div>
  );
}
