import sql from '../db/index.js';

export async function listAllUsers() {
  const rows = await sql`
    SELECT user_id AS id, name, email, role, status, warnings
    FROM "User"
    ORDER BY user_id ASC
  `;
  return rows;
}

export async function warnUser(id, message = 'Policy violation') {
  const rows = await sql`
    UPDATE "User"
    SET warnings = COALESCE(warnings, 0) + 1, updated_at = NOW()
    WHERE user_id = ${id} AND role <> 'admin'
    RETURNING user_id AS id, name, email, status, warnings
  `;
  return rows[0] || null;
}

export async function suspendUser(id, reason = 'Manual suspend') {
  const rows = await sql`
    UPDATE "User"
    SET status = 'suspended', updated_at = NOW()
    WHERE user_id = ${id} AND role <> 'admin'
    RETURNING user_id AS id, name, email, status, warnings
  `;
  return rows[0] || null;
}

export async function unsuspendUser(id) {
  const rows = await sql`
    UPDATE "User"
    SET status = 'active', updated_at = NOW()
    WHERE user_id = ${id} AND role <> 'admin'
    RETURNING user_id AS id, name, email, status, warnings
  `;
  return rows[0] || null;
}
