import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { hashPassword, generatePassword, verifyPassword } from "@/lib/password";

export interface CustomerRecord {
  id: number;
  email: string;
  name: string;
}

export async function getCustomerByEmail(email: string): Promise<CustomerRecord | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT id, email, name FROM customers WHERE email = ?`, [
    email.trim().toLowerCase(),
  ]);
  const row = rows[0];
  return row ? { id: row.id, email: row.email, name: row.name } : null;
}

export async function verifyCustomerPassword(email: string, password: string): Promise<CustomerRecord | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM customers WHERE email = ?`, [
    email.trim().toLowerCase(),
  ]);
  const row = rows[0];
  if (!row) return null;
  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return null;
  return { id: row.id, email: row.email, name: row.name };
}

/** Finds the customer account for this email, or creates one with a fresh
 * random password. Called once an order is confirmed paid (never for an
 * order that hasn't been paid yet) — fulfillOrder.ts emails the password
 * to the customer only when a new account was actually created, never on
 * a repeat order from an existing customer. */
export async function findOrCreateCustomer(
  email: string,
  name: string,
): Promise<{ customer: CustomerRecord; isNew: boolean; plainPassword?: string }> {
  const existing = await getCustomerByEmail(email);
  if (existing) return { customer: existing, isNew: false };

  const plainPassword = generatePassword();
  const passwordHash = await hashPassword(plainPassword);

  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO customers (email, password_hash, name) VALUES (?, ?, ?)`,
    [email.trim().toLowerCase(), passwordHash, name],
  );

  return { customer: { id: result.insertId, email: email.trim().toLowerCase(), name }, isNew: true, plainPassword };
}
