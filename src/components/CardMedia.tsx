import Image from "next/image";
import { isVideoUrl } from "@/lib/media/isVideoUrl";

// Renders either a still image or a silent looping video. Two modes:
//  - fill=true (default): fills whatever fixed-aspect container it's
//    placed in (e.g. the film detail hero's aspect-[3/4] box) — swapping
//    an image for a video never changes that container's dimensions.
//  - fill=false: renders at its own natural aspect ratio instead (for a
//    masonry grid — see FilmCard — where every poster keeps its real
//    proportions rather than being cropped into a uniform box).
export default function CardMedia({
  src,
  alt,
  sizes,
  priority,
  fill = true,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
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
        className={fill ? "absolute inset-0 h-full w-full object-cover" : "block w-full h-auto"}
      />
    );
  }
  if (!fill) {
    // eslint-disable-next-line @next/next/no-img-element -- intrinsic
    // sizing is exactly the point here; next/image without fill would
    // need real width/height, which posters don't have stored.
    return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className="block w-full h-auto" />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />;
}
