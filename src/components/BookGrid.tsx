import type { Book } from "@/content/books";
import BookCard from "./BookCard";

export default function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10 max-w-3xl">
      {books.map((book) => (
        <BookCard key={book.slug} book={book} />
      ))}
    </div>
  );
}
