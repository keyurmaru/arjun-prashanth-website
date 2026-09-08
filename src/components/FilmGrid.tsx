import type { Film } from "@/content/films";
import FilmCard from "./FilmCard";

export default function FilmGrid({ films }: { films: Film[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
      {films.map((film) => (
        <FilmCard key={film.slug} film={film} />
      ))}
    </div>
  );
}
