import { getPool } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

export async function logAction(
  admin: SessionPayload,
  action: string,
  entityType: string,
  entityId: string | number,
  details?: Record<string, unknown>,
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO audit_log (admin_user_id, admin_email, action, entity_type, entity_id, details_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [admin.sub, admin.email, action, entityType, String(entityId), details ? JSON.stringify(details) : null],
  );
}
