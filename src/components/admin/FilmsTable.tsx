"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FilmRecord } from "@/lib/filmsRepo";

export default function FilmsTable({ films }: { films: FilmRecord[] }) {
  const router = useRouter();

  async function handleArchive(id: number) {
    if (!confirm("Archive this film? It will be removed from the public site.")) return;
    await fetch(`/api/admin/films/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <table className="w-full text-[14px] bg-white border border-black/10">
      <thead>
        <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.08em] text-black/50">
          <th className="p-3">Title</th>
          <th className="p-3">Role</th>
          <th className="p-3">Status</th>
          <th className="p-3">Featured</th>
          <th className="p-3"></th>
        </tr>
      </thead>
      <tbody>
        {films.map((film) => (
          <tr key={film.id} className="border-b border-black/5">
            <td className="p-3">
              <Link href={`/admin/films/${film.id}`} className="hover:underline">
                {film.title}
              </Link>
            </td>
            <td className="p-3 text-black/60">{film.officialRole}</td>
            <td className="p-3">
              <StatusBadge status={film.status} />
            </td>
            <td className="p-3 text-black/60">{film.featured ? `Yes (#${film.featuredOrder})` : "—"}</td>
            <td className="p-3 text-right">
              <Link href={`/admin/films/${film.id}`} className="text-black/50 hover:text-black text-[12px] mr-4">
                Edit
              </Link>
              {film.status !== "ARCHIVED" && (
                <button type="button" onClick={() => handleArchive(film.id)} className="text-black/50 hover:text-red-600 text-[12px]">
                  Archive
                </button>
              )}
            </td>
          </tr>
        ))}
        {films.length === 0 && (
          <tr>
            <td colSpan={5} className="p-6 text-center text-black/40">
              No films yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }: { status: FilmRecord["status"] }) {
  const colors: Record<FilmRecord["status"], string> = {
    DRAFT: "bg-gray-200 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-400",
  };
  return <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-[0.05em] ${colors[status]}`}>{status}</span>;
}
