import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { bookInputSchema } from "@/lib/validation";
import { listBooksAdmin, createBook } from "@/lib/booksRepo";
import { logAction } from "@/lib/auditLog";

export async function GET() {
  const books = await listBooksAdmin();
  return NextResponse.json({ ok: true, books });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

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

  let bookId: number;
  try {
    bookId = await createBook(parsed.data);
  } catch (err) {
    const message = err instanceof Error && err.message.includes("Duplicate") ? "That slug is already in use." : "Could not create the book.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  await logAction(session, "book.create", "book", bookId, { title: parsed.data.title, status: parsed.data.status });
  return NextResponse.json({ ok: true, id: bookId });
}
