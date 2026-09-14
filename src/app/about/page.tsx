import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import { aboutMilestones, storyWorlds } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

const title = "About";
const description =
  "Arjun Prashanth is a film director, screenwriter and author whose work is rooted in character, emotional conflict and cinematic storytelling.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/about" });

// Supplied directly by Arjun Prashanth, uploaded via the Media Library —
// 2026-09-14.
const aboutPhotos = [
  "/media-files/2026/09/8c8800b6-a79a-4777-a6e1-ae44fc0d35cf.jpg",
  "/media-files/2026/09/258bab83-1756-4ae3-bf91-e33815be2111.jpg",
];

export default function AboutPage() {
  return (
    <div className="bg-dark-950">
      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <Reveal>
            <SectionHeading as="h1" eyebrow="Arjun Prashanth" title="About" />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-[1fr_1.1fr] gap-14">
          <Reveal variant="left">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {aboutPhotos.map((src) => (
                <div key={src} className="relative aspect-[3/4] w-full bg-dark-800 border border-dark-800">
                  <Image src={src} alt="Arjun Prashanth" fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-inter text-[15px] leading-relaxed text-muted space-y-5">
              <p>
                Arjun Prashanth is a film director, screenwriter and author whose work is rooted in character,
                emotional conflict and cinematic storytelling.
              </p>
              <p>
                Formally trained in filmmaking in the United Kingdom, Arjun developed a foundation across direction,
                screenwriting, editing and visual storytelling. His creative approach begins with the emotional
                psychology of a protagonist and expands into conflict, relationships, dramatic structure and visual
                language.
              </p>
              <p>
                His screenwriting interests span crime drama, investigative thrillers, courtroom and legal stories,
                action, psychological conflict, contemporary relationships, female-centric narratives and
                emotionally driven commercial cinema. Across genres, his focus remains on human behaviour under
                pressure and the consequences of difficult choices.
              </p>
              <p>
                Alongside cinema, Arjun writes fiction. Literature allows him to explore thought, memory, moral
                contradiction and emotional consequence with a depth distinct from screenplay form. His published
                literary work includes The Line That Holds, a literary crime novel centred on truth, responsibility,
                loyalty and consequence.
              </p>
              <p>
                Whether developing a screenplay, directing a film or writing a novel, the objective remains
                consistent: create distinctive characters, emotional weight and a story that stays with the audience
                beyond the final frame or page.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <SectionHeading eyebrow="Creative Philosophy" title="Emotion → Character → Conflict → Cinema" />
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
            <SectionHeading eyebrow="Milestones" title="A Working Life in Story" />
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {aboutMilestones.map((m) => (
                <li key={m} className="font-inter text-[13px] text-muted border-t border-dark-800 pt-4">
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <div className="flex gap-6 mt-12">
              <Link href="/director" className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors">
                Director Profile →
              </Link>
              <Link href="/author" className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze hover:text-bronze-light transition-colors">
                Author Profile →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow="Get In Touch"
        title="Want to know more, or start a conversation?"
        ctaLabel="Get in Touch"
        ctaHref="/contact"
      />
    </div>
  );
}
