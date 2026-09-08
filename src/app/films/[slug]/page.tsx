import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { getFilmPublicBySlug } from "@/lib/filmsRepo";
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
    image: film.posterUrl || undefined,
  });
}

function toYouTubeEmbed(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

export default async function FilmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getFilmPublicBySlug(slug);
  if (!film) notFound();

  const embedUrl = film.trailerUrl ? toYouTubeEmbed(film.trailerUrl) : null;

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
          ...(embedUrl ? { trailer: { "@type": "VideoObject", name: `${film.title} — Watch Film`, embedUrl } } : {}),
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
              <div className="relative aspect-[2/3] w-full max-w-sm">
                <Image
                  src={film.posterUrl}
                  alt={`${film.title} — poster`}
                  fill
                  sizes="(min-width: 1024px) 380px, 80vw"
                  className="object-cover"
                  priority
                />
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

            {embedUrl && (
              <div className="mt-10 max-w-xl">
                <div className="relative aspect-video w-full bg-dark-900 border border-dark-800">
                  <iframe
                    src={embedUrl}
                    title={`${film.title} — Watch Film`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {!embedUrl && !film.synopsis && (
              <p className="font-inter text-[12px] tracking-[0.1em] uppercase text-muted/60 mt-8">
                Further details on this project available on request.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow="Collaboration"
        title="Have a project, role or collaboration in mind?"
        ctaLabel="Discuss a Film"
        ctaHref="/contact"
      />
    </div>
  );
}
