import { notFound } from "next/navigation";
import { getBookAdminById } from "@/lib/booksRepo";
import BookForm from "@/components/admin/BookForm";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookAdminById(Number(id));
  if (!book) notFound();

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">Edit Book</h1>
      <BookForm book={book} />
    </div>
  );
}
