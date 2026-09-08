"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookRecord } from "@/lib/booksRepo";

export default function BooksTable({ books }: { books: BookRecord[] }) {
  const router = useRouter();

  async function handleArchive(id: number) {
    if (!confirm("Archive this book? It will be removed from the public site.")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <table className="w-full text-[14px] bg-white border border-black/10">
      <thead>
        <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.08em] text-black/50">
          <th className="p-3">Title</th>
          <th className="p-3">Status</th>
          <th className="p-3">Variants</th>
          <th className="p-3">Stock</th>
          <th className="p-3"></th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book.id} className="border-b border-black/5">
            <td className="p-3">
              <Link href={`/admin/books/${book.id}`} className="hover:underline">
                {book.title}
              </Link>
            </td>
            <td className="p-3">
              <StatusBadge status={book.status} />
            </td>
            <td className="p-3 text-black/60">{book.variants.map((v) => v.format).join(", ") || "—"}</td>
            <td className="p-3 text-black/60">{book.variants.reduce((sum, v) => sum + v.stock, 0)}</td>
            <td className="p-3 text-right">
              <Link href={`/admin/books/${book.id}`} className="text-black/50 hover:text-black text-[12px] mr-4">
                Edit
              </Link>
              {book.status !== "ARCHIVED" && (
                <button type="button" onClick={() => handleArchive(book.id)} className="text-black/50 hover:text-red-600 text-[12px]">
                  Archive
                </button>
              )}
            </td>
          </tr>
        ))}
        {books.length === 0 && (
          <tr>
            <td colSpan={5} className="p-6 text-center text-black/40">
              No books yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }: { status: BookRecord["status"] }) {
  const colors: Record<BookRecord["status"], string> = {
    DRAFT: "bg-gray-200 text-gray-700",
    COMING_SOON: "bg-blue-100 text-blue-700",
    PRE_ORDER: "bg-purple-100 text-purple-700",
    PUBLISHED: "bg-green-100 text-green-700",
    OUT_OF_STOCK: "bg-amber-100 text-amber-700",
    ARCHIVED: "bg-gray-100 text-gray-400",
  };
  return <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-[0.05em] ${colors[status]}`}>{status.replace("_", " ")}</span>;
}
