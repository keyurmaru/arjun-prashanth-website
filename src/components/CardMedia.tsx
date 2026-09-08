import Image from "next/image";
import { isVideoUrl } from "@/lib/media/isVideoUrl";

// Fills whatever fixed-aspect container it's placed in, with either a
// still image or a silent looping video — the container's size is set by
// the parent (e.g. FilmCard's aspect-[2/3] box), so swapping an image for a
// video never changes the card's dimensions.
export default function CardMedia({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />;
}
