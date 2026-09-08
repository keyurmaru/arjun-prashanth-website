import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import GalleryGrid from "@/components/GalleryGrid";
import { galleryImages } from "@/content/gallery";
import { buildMetadata } from "@/lib/seo";

const title = "Gallery";
const description = "Behind-the-scenes photography from Arjun Prashanth Rao's work in film.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/gallery" });

export default function GalleryPage() {
  return (
    <div className="bg-dark-950 min-h-screen">
      <section className="pt-40 pb-16 lg:pb-20 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />
          <Reveal>
            <SectionHeading
              as="h1"
              eyebrow="Gallery"
              title="Behind the Scenes"
              description="A collection of on-set and production photography. Tap or click any image to view it larger — hold or double-click to zoom."
            />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <Reveal>
            <GalleryGrid images={galleryImages} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
