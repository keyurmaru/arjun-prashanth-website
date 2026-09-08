import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { testConnection } from "@/lib/shiprocket";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const result = await testConnection();
  return NextResponse.json(result);
}
