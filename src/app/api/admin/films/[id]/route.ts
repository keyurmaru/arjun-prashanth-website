import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { filmInputSchema } from "@/lib/validation";
import { getFilmAdminById, updateFilm, archiveFilm } from "@/lib/filmsRepo";
import { logAction } from "@/lib/auditLog";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const film = await getFilmAdminById(Number(id));
  if (!film) return NextResponse.json({ ok: false, error: "Film not found." }, { status: 404 });
  return NextResponse.json({ ok: true, film });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const filmId = Number(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = filmInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await updateFilm(filmId, parsed.data);
  } catch (err) {
    const message = err instanceof Error && err.message.includes("Duplicate") ? "That slug is already in use." : "Could not update the film.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  await logAction(session, "film.update", "film", filmId, { title: parsed.data.title, status: parsed.data.status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  await archiveFilm(Number(id));
  await logAction(session, "film.archive", "film", id);
  return NextResponse.json({ ok: true });
}
