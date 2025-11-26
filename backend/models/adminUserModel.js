import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: false // local không cần SSL
});

export async function listNonAdminUsers() {
  const q = `
    SELECT user_id AS id, name, email, role, status, warnings
    FROM "User"
    ORDER BY user_id ASC
    LIMIT 200;
  `;
  const { rows } = await pool.query(q);
  return rows;
}

export async function warnUser(id, message = 'Policy violation') {
  const q = `
    UPDATE "User"
    SET warnings = COALESCE(warnings, 0) + 1, updated_at = NOW()
    WHERE user_id = $1 AND role <> 'admin'
    RETURNING user_id AS id, name, email, status, warnings;
  `;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
}

export async function suspendUser(id, reason = 'Manual suspend') {
  const q = `
    UPDATE "User"
    SET status = 'suspended', updated_at = NOW()
    WHERE user_id = $1 AND role <> 'admin'
    RETURNING user_id AS id, name, email, status, warnings;
  `;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
}
