// backend/db/seedUsers.js
import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upsertUser(name, email, plainPassword, role = 'user', status = 'active') {
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const sql = `
    INSERT INTO "User"(name, email, password_hash, role, status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      status = EXCLUDED.status
    RETURNING user_id, name, email, role, status;
  `;
  const { rows } = await pool.query(sql, [name, email, passwordHash, role, status]);
  return rows[0];
}

(async function main() {
  try {
    const u1 = await upsertUser('Alice', 'alice@campus.edu', 'alice123');
    const u2 = await upsertUser('Bob',   'bob@campus.edu',   'bob123');
    console.log('Seeded users:', u1, u2);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
