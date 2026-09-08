import { notFound } from "next/navigation";
import { getFilmAdminById } from "@/lib/filmsRepo";
import FilmForm from "@/components/admin/FilmForm";

export default async function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const film = await getFilmAdminById(Number(id));
  if (!film) notFound();

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">Edit Film</h1>
      <FilmForm film={film} />
    </div>
  );
}
