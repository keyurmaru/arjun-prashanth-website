import type { FilmRecord } from "@/lib/filmsRepo";
import FilmCard from "./FilmCard";

// Masonry via CSS columns rather than a fixed-row grid — posters/videos
// keep their own natural proportions (see FilmCard/CardMedia) instead of
// being cropped into a uniform box, and each card's own bottom margin
// (not a row `gap`, which multi-column layout doesn't support vertically)
// spaces items apart.
export default function FilmGrid({ films }: { films: FilmRecord[] }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-8 lg:gap-10 [column-fill:balance]">
      {films.map((film) => (
        <FilmCard key={film.slug} film={film} />
      ))}
    </div>
  );
}
