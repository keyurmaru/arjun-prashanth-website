import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { filmInputSchema } from "@/lib/validation";
import { listFilmsAdmin, createFilm } from "@/lib/filmsRepo";
import { logAction } from "@/lib/auditLog";

export async function GET() {
  const films = await listFilmsAdmin();
  return NextResponse.json({ ok: true, films });
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

  const parsed = filmInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  let filmId: number;
  try {
    filmId = await createFilm(parsed.data);
  } catch (err) {
    const message = err instanceof Error && err.message.includes("Duplicate") ? "That slug is already in use." : "Could not create the film.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  await logAction(session, "film.create", "film", filmId, { title: parsed.data.title, status: parsed.data.status });
  return NextResponse.json({ ok: true, id: filmId });
}
