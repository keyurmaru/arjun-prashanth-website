import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/** Lazily creates the shared connection pool. Returns null when DB_* env
 * vars aren't configured, so callers can fail loudly with a clear error
 * rather than mysql2 throwing an opaque connection error. */
export function getPool(): mysql.Pool {
  if (pool) return pool;
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error("Database not configured — set DB_HOST/DB_NAME/DB_USER/DB_PASSWORD.");
  }
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
  });
  return pool;
}
