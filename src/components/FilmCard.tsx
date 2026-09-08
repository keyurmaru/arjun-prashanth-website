import Image from "next/image";
import Link from "next/link";
import type { FilmRecord } from "@/lib/filmsRepo";

export default function FilmCard({ film }: { film: FilmRecord }) {
  return (
    <Link href={`/films/${film.slug}`} className="group block">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-dark-800 border border-dark-800 group-hover:border-bronze/50 transition-colors duration-300">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} — poster`}
            fill
            sizes="(min-width: 1024px) 280px, 45vw"
            className="object-cover"
          />
        ) : (
          // No verified poster exists yet for this credit — a typographic
          // placeholder is used instead of a stock image, per the
          // no-invented-imagery rule.
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-inter text-[9px] tracking-[0.2em] uppercase text-muted/70 mb-4">Poster Coming Soon</p>
            <p className="font-cormorant text-2xl text-ivory-100 leading-tight">{film.title}</p>
            <span className="mt-5 h-px w-8 bg-bronze/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-4">
        <p className="font-cormorant text-xl text-ivory-100 group-hover:text-bronze-light transition-colors">{film.title}</p>
        <p className="font-inter text-[11px] tracking-[0.08em] uppercase text-muted mt-1">{film.officialRole}</p>
        <p className="font-inter text-[11px] text-muted/80 mt-1">
          {[film.year, film.language, film.genre].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
