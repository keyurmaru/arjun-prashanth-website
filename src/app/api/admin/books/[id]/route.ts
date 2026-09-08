import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { bookInputSchema } from "@/lib/validation";
import { getBookAdminById, updateBook, archiveBook } from "@/lib/booksRepo";
import { logAction } from "@/lib/auditLog";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookAdminById(Number(id));
  if (!book) return NextResponse.json({ ok: false, error: "Book not found." }, { status: 404 });
  return NextResponse.json({ ok: true, book });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const bookId = Number(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await updateBook(bookId, parsed.data);
  } catch (err) {
    const message = err instanceof Error && err.message.includes("Duplicate") ? "That slug is already in use." : "Could not update the book.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  await logAction(session, "book.update", "book", bookId, { title: parsed.data.title, status: parsed.data.status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  await archiveBook(Number(id));
  await logAction(session, "book.archive", "book", id);
  return NextResponse.json({ ok: true });
}
