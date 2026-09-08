import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import CardMedia from "@/components/CardMedia";
import { getFilmPublicBySlug } from "@/lib/filmsRepo";
import { isVideoUrl } from "@/lib/media/isVideoUrl";
import { buildMetadata } from "@/lib/seo";

// Films are DB-backed and can change independently of a deploy — this page
// is intentionally dynamic (no generateStaticParams) rather than statically
// generated at build time, and the DB is only reachable from the live
// server, not the GitHub Actions build runner.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilmPublicBySlug(slug);
  if (!film) return buildMetadata({ title: "Film Not Found", description: "", path: `/films/${slug}` });
  return buildMetadata({
    title: film.seoTitle || `${film.title} (${film.year ?? "Year TBC"})`,
    description: film.seoDescription || `${film.title} — ${film.officialRole}, ${film.language}. ${film.credits}`,
    path: `/films/${film.slug}`,
    // A video card can't be a social-preview image — fall back to the
    // first gallery still in that case.
    image: (isVideoUrl(film.posterUrl) ? film.gallery[0]?.imageUrl : film.posterUrl) || undefined,
  });
}

type PlayableVideo = { kind: "iframe"; embedUrl: string } | { kind: "file"; fileUrl: string };

function resolvePlayable(url: string): PlayableVideo | null {
  const youtube = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (youtube) return { kind: "iframe", embedUrl: `https://www.youtube-nocookie.com/embed/${youtube[1]}` };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", embedUrl: `https://player.vimeo.com/video/${vimeo[1]}` };

  // Directly-uploaded video, served from the persistent media store.
  if (url.startsWith("/media-files/")) return { kind: "file", fileUrl: url };

  return null;
}

export default async function FilmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getFilmPublicBySlug(slug);
  if (!film) notFound();

  const embeddedVideos = film.videos
    .map((v) => ({ ...v, playable: resolvePlayable(v.videoUrl) }))
    .filter((v): v is typeof v & { playable: PlayableVideo } => !!v.playable);
  const primaryEmbed = embeddedVideos.find((v) => v.playable.kind === "iframe")?.playable as
    | { kind: "iframe"; embedUrl: string }
    | undefined;

  return (
    <div className="bg-dark-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Movie",
          name: film.title,
          genre: film.genre,
          ...(film.year ? { dateCreated: film.year } : {}),
          inLanguage: film.language,
          ...(primaryEmbed
            ? { trailer: { "@type": "VideoObject", name: `${film.title} — Watch Film`, embedUrl: primaryEmbed.embedUrl } }
            : {}),
        }}
      />

      <section className="pt-40 pb-16 border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Films", href: "/films" }, { label: film.title }]}
          />
        </div>
      </section>

      <section className="border-b border-dark-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20 grid lg:grid-cols-[380px_1fr] gap-14">
          <Reveal variant="left">
            {film.posterUrl ? (
              <div className="relative aspect-[2/3] w-full max-w-sm overflow-hidden bg-dark-800">
                <CardMedia src={film.posterUrl} alt={`${film.title} — poster`} sizes="(min-width: 1024px) 380px, 80vw" priority />
              </div>
            ) : (
              <div className="relative aspect-[2/3] w-full max-w-sm bg-dark-800 border border-dark-800 flex flex-col items-center justify-center px-6 text-center">
                <p className="font-inter text-[9px] tracking-[0.2em] uppercase text-muted/70 mb-4">Poster Coming Soon</p>
                <p className="font-cormorant text-3xl text-ivory-100 leading-tight">{film.title}</p>
                <span className="mt-5 h-px w-8 bg-bronze/60" />
              </div>
            )}
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-cormorant font-medium text-ivory-100" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}>
              {film.title}
            </h1>
            <p className="font-inter text-[12px] tracking-[0.1em] uppercase text-bronze mt-4">{film.officialRole}</p>
            <p className="font-inter text-[13px] text-muted mt-2">
              {[film.year ?? "Year details on request", film.language, film.genre].filter(Boolean).join(" · ")}
            </p>
            <p className="font-inter text-[15px] leading-relaxed text-muted mt-8 max-w-xl">{film.credits}</p>

            {film.synopsis && (
              <p className="font-inter text-[15px] leading-relaxed text-muted mt-6 max-w-xl">{film.synopsis}</p>
            )}

            {embeddedVideos.length > 0 && (
              <div className="mt-10 max-w-xl space-y-8">
                {embeddedVideos.map((v) => (
                  <div key={v.id}>
                    {v.title && (
                      <p className="font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-2">{v.title}</p>
                    )}
                    <div className="relative aspect-video w-full bg-dark-900 border border-dark-800">
                      {v.playable.kind === "iframe" ? (
                        <iframe
                          src={v.playable.embedUrl}
                          title={v.title ? `${film.title} — ${v.title}` : `${film.title} — Watch Film`}
                          className="absolute inset-0 h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={v.playable.fileUrl}
                          poster={v.posterUrl || undefined}
                          controls
                          preload="metadata"
                          className="absolute inset-0 h-full w-full object-contain bg-black"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {embeddedVideos.length === 0 && !film.synopsis && (
              <p className="font-inter text-[12px] tracking-[0.1em] uppercase text-muted/60 mt-8">
                Further details on this project available on request.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {film.gallery.length > 0 && (
        <section className="border-b border-dark-800">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <Reveal>
              <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze mb-8">Gallery</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {film.gallery.map((img) => (
                  <div key={img.id}>
                    <div className="relative aspect-[4/3] w-full bg-dark-800 border border-dark-800">
                      <Image src={img.imageUrl} alt={img.caption || `${film.title} — still`} fill sizes="(min-width: 1024px) 33vw, 90vw" className="object-cover" />
                    </div>
                    {img.caption && <p className="font-inter text-[12px] text-muted mt-2">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <CTASection
        eyebrow="Collaboration"
        title="Have a project, role or collaboration in mind?"
        ctaLabel="Discuss a Film"
        ctaHref="/contact"
      />
    </div>
  );
}
