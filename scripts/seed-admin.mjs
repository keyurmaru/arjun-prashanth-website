// One-time (or re-runnable) script to create/reset the SUPER_ADMIN account.
// Run from the project root with DB_* env vars set:
//   DB_HOST=127.0.0.1 DB_NAME=... DB_USER=... DB_PASSWORD=... \
//     node scripts/seed-admin.mjs owner@example.com 'a-strong-password' 'Owner Name'
//
// Safe to re-run: re-running with the same email resets that user's password
// and guarantees SUPER_ADMIN + active, rather than erroring on a duplicate.

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const [, , email, password, name] = process.argv;

if (!email || !password || !name) {
  console.error("Usage: node scripts/seed-admin.mjs <email> <password> <name>");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error("Set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in the environment first.");
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

const passwordHash = await bcrypt.hash(password, 12);

await pool.execute(
  `INSERT INTO admin_users (email, password_hash, name, role, active)
   VALUES (?, ?, ?, 'SUPER_ADMIN', 1)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), role = 'SUPER_ADMIN', active = 1`,
  [email.trim().toLowerCase(), passwordHash, name],
);

console.log(`SUPER_ADMIN ready: ${email}`);
await pool.end();
