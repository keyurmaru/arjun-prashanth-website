import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPool } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";

const schema = z.object({
  bookId: z.number().int().positive(),
  email: z.string().trim().email().max(200),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`notify-me:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const pool = getPool();
  await pool.execute(`INSERT INTO notify_me (book_id, email) VALUES (?, ?)`, [parsed.data.bookId, parsed.data.email]);

  return NextResponse.json({ ok: true });
}
