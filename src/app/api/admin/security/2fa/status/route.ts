import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });

  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT totp_enabled FROM admin_users WHERE id = ?`, [session.sub]);
  const [codeRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as remaining FROM admin_totp_backup_codes WHERE admin_user_id = ? AND used_at IS NULL`,
    [session.sub],
  );

  return NextResponse.json({
    ok: true,
    enabled: !!rows[0]?.totp_enabled,
    backupCodesRemaining: codeRows[0]?.remaining ?? 0,
  });
}
