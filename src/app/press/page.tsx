import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import { buildMetadata } from "@/lib/seo";

const title = "Press";
const description = "Press coverage, interviews and features on Arjun Prashanth Rao.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/press" });

// No verified press coverage exists yet in the source material. Per the
// no-invention rule, this renders a clean empty state — styled as the same
// "Selected Coverage" row-list treatment used on the homepage — rather than
// fabricated headlines, publications or quotes.
export default function PressPage() {
  return (
    <div className="bg-ivory-100 text-near-black min-h-screen">
      <section className="pt-40 pb-16 lg:pb-20 border-b border-dark-800/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Press" }]} />
          <Reveal>
            <p className="font-inter text-[11px] tracking-[0.2em] uppercase text-bronze mb-4">Press &amp; Media</p>
            <h1 className="font-cormorant font-medium text-near-black" style={{ fontSize: "clamp(2.5rem, 6vw, 4.25rem)" }}>
              Selected Coverage
            </h1>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <div className="border-t border-dark-800/15">
              <div className="flex flex-col items-center text-center border-b border-dark-800/15 py-20 gap-2">
                <p className="font-cormorant text-2xl text-near-black">Press Coverage — Coming Soon</p>
                <p className="font-inter text-[13px] text-near-black/60 max-w-md">
                  Verified interviews, articles and features will be published here as they become available.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection tone="ivory" eyebrow="Media" title="Press or media enquiry?" ctaLabel="Get in Touch" ctaHref="/contact" />
    </div>
  );
}
