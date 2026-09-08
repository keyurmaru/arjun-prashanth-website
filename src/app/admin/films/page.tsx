import Link from "next/link";
import { listFilmsAdmin } from "@/lib/filmsRepo";
import FilmsTable from "@/components/admin/FilmsTable";

export default async function AdminFilmsPage() {
  const films = await listFilmsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Films</h1>
        <Link href="/admin/films/new" className="bg-black text-white text-[13px] px-4 py-2">
          New Film
        </Link>
      </div>
      <FilmsTable films={films} />
    </div>
  );
}
