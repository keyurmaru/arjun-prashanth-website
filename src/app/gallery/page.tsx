import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import GalleryGrid from "@/components/GalleryGrid";
import { galleryImages } from "@/content/gallery";
import { getPublicGalleryImages } from "@/lib/mediaRepo";
import { buildMetadata } from "@/lib/seo";

const title = "Gallery";
const description = "Behind-the-scenes photography from Arjun Prashanth's work in film.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/gallery" });

// Merges the original static production stills with every image uploaded
// since (via a Film/Book form's picker or directly in the Media Library) —
// the latter is DB-backed and changes whenever an admin uploads or edits
// an image, so this can't be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const uploaded = await getPublicGalleryImages();
  const images = [...uploaded, ...galleryImages];

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
              description="A collection of on-set, production, and event photography. Tap or click any image to view it larger — hold or double-click to zoom."
            />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <Reveal>
            <GalleryGrid images={images} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
