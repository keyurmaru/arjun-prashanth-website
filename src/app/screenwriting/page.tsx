import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import ScreenwritingForm from "@/components/ScreenwritingForm";
import { screenwritingAreas } from "@/content/site";
import { screenwritingProjects } from "@/content/screenwriting";
import { buildMetadata } from "@/lib/seo";

const title = "Screenwriting";
const description =
  "Screenwriting by Arjun Prashanth — feature-film screenplays and story development across crime, thriller, courtroom drama and emotionally driven commercial cinema.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/screenwriting" });

export default function ScreenwritingPage() {
  return (
    <div className="bg-dark-950">
      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Screenwriting" }]} />
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow="Screenwriting"
              title="Stories written for the screen. Built to be felt before they are filmed."
              description="Arjun develops screen stories from character, desire, contradiction and consequence. The intention is not merely to create plot mechanics, but to build scenes where external events expose internal conflict."
            />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <SectionHeading eyebrow="The Writing Approach" title="Writing Areas" />
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
              {screenwritingAreas.map((a) => (
                <li key={a} className="font-inter text-[13px] text-muted border-l-2 border-bronze/40 pl-4 py-1">
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <blockquote className="font-cormorant italic text-xl text-bronze-light border-l-2 border-bronze/50 pl-6 py-1 mt-14 max-w-2xl">
              &ldquo;A screenplay is not finished when every scene is written. It is finished when every scene has a
              reason to exist.&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <SectionHeading eyebrow="In Development" title="Selected Screenwriting Projects" />
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-8 mt-12">
            {screenwritingProjects.map((project, i) => (
              <Reveal key={project.title} delay={100 + i * 40}>
                <div className="border-l-2 border-bronze/40 pl-6 py-1">
                  <p className="font-cormorant text-2xl text-ivory-100">{project.title}</p>
                  <p className="font-inter text-[11px] tracking-[0.08em] uppercase text-bronze mt-1">{project.genre}</p>
                  <p className="font-inter text-[14px] leading-relaxed text-muted mt-3">{project.logline}</p>
                  <p className="font-inter text-[10px] tracking-[0.1em] uppercase text-muted/60 mt-3">{project.status}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <p className="font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-4">A Note on Confidentiality</p>
            <p className="font-inter text-[15px] leading-relaxed text-muted max-w-2xl">
              The titles and loglines above are public-safe summaries only. Full treatments, twists, casting,
              budgets and manuscripts are confidential and discussed privately with qualified production partners.
              Additional projects in development remain private until formally announced. Please do not submit a
              complete screenplay through the enquiry form below — a short concept is enough to begin a
              conversation.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <SectionHeading eyebrow="Discuss a Story" title="Screenwriting Enquiry" />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-12">
              <ScreenwritingForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
