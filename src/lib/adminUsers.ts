import { getPool } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import type { AdminRole } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface AdminUserRecord {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, email, name, role, active, created_at FROM admin_users ORDER BY created_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    active: !!r.active,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}

export async function createAdminUser(input: { email: string; name: string; password: string; role: AdminRole }): Promise<number> {
  const pool = getPool();
  const passwordHash = await hashPassword(input.password);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
    [input.email.trim().toLowerCase(), passwordHash, input.name, input.role],
  );
  return result.insertId;
}

export async function setAdminUserActive(id: number, active: boolean): Promise<void> {
  const pool = getPool();
  await pool.execute(`UPDATE admin_users SET active = ? WHERE id = ?`, [active ? 1 : 0, id]);
}

export async function setAdminUserRole(id: number, role: AdminRole): Promise<void> {
  const pool = getPool();
  await pool.execute(`UPDATE admin_users SET role = ? WHERE id = ?`, [role, id]);
}
