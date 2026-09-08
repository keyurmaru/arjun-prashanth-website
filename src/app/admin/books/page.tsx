import Link from "next/link";
import { listBooksAdmin } from "@/lib/booksRepo";
import BooksTable from "@/components/admin/BooksTable";

export default async function AdminBooksPage() {
  const books = await listBooksAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Books</h1>
        <Link href="/admin/books/new" className="bg-black text-white text-[13px] px-4 py-2">
          New Book
        </Link>
      </div>
      <BooksTable books={books} />
    </div>
  );
}
