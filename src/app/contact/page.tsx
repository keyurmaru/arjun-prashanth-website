import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

const title = "Contact";
const description = "Contact Arjun Prashanth for film, screenwriting, editing, publishing, media or collaboration enquiries.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/contact" });

const categories = [
  "Film / Direction",
  "Screenwriting / Story",
  "Editing",
  "Publishing / Literary",
  "Media",
  "Speaking",
  "Adaptation Rights",
  "General / Collaboration",
];

export default function ContactPage() {
  return (
    <div className="bg-dark-950">
      <section className="pt-40 pb-20 lg:pb-28 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <Reveal>
            <SectionHeading as="h1" eyebrow="Get In Touch" title="Contact" />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-[1fr_1.2fr] gap-16">
          <Reveal variant="left">
            <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze mb-6">Enquiry Categories</p>
            <ul className="grid grid-cols-2 gap-3 mb-12">
              {categories.map((c) => (
                <li key={c} className="font-inter text-[12px] text-muted border-l-2 border-bronze/40 pl-3 py-0.5">
                  {c}
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <div>
                <p className="font-inter text-[10px] tracking-[0.14em] uppercase text-muted">Email</p>
                <a href={`mailto:${site.email}`} className="font-cormorant text-xl text-ivory-100 hover:text-bronze transition-colors">
                  {site.email}
                </a>
              </div>
              <div>
                <p className="font-inter text-[10px] tracking-[0.14em] uppercase text-muted">WhatsApp</p>
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-cormorant text-xl text-ivory-100 hover:text-bronze transition-colors"
                >
                  {site.whatsapp}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
