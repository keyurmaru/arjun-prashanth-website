"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/content/gallery";
import Lightbox from "./Lightbox";

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:balance]">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setOpenIndex(i)}
            className="group relative block w-full mb-4 break-inside-avoid overflow-hidden bg-dark-800 focus-visible:outline-2 focus-visible:outline-bronze"
            aria-label={`Open image ${i + 1} of ${images.length}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="w-full h-auto grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 scale-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
              loading={i < 8 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/10 transition-colors duration-500" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox images={images} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
      )}
    </>
  );
}
