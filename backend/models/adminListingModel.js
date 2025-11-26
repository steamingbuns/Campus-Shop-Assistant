import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** List listings (optional filter by status) */
export async function listListings(status) {
  const params = [];
  let where = '';
  if (status) { where = 'WHERE status = $1'; params.push(status); }

  const q = `
    SELECT
      product_id AS id,
      description AS title,   -- DB không có cột 'title', dùng description để hiển thị
      description,
      price,
      status,
      create_at AS created_at
    FROM "Product"
    ${where}
    ORDER BY product_id DESC
    LIMIT 200;
  `;
  const { rows } = await pool.query(q, params);
  return rows;
}

/** Approve listing: set status = 'active' and return row */
export async function approveListing(id) {
  const q = `
    UPDATE "Product"
    SET status = 'active', updated_at = NOW()
    WHERE product_id = $1
    RETURNING
      product_id AS id,
      description AS title,
      description,
      price,
      status,
      updated_at;
  `;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
}

/** Edit listing (cho phép sửa description/price/status) */
export async function editListing(id, payload = {}) {
  const q = `
    UPDATE "Product"
    SET
      description = COALESCE($2, description),
      price       = COALESCE($3, price),
      status      = COALESCE($4, status),
      updated_at  = NOW()
    WHERE product_id = $1
    RETURNING
      product_id AS id,
      description AS title,
      description,
      price,
      status,
      updated_at;
  `;
  const params = [id, payload.description ?? null, payload.price ?? null, payload.status ?? null];
  const { rows } = await pool.query(q, params);
  return rows[0] || null;
}

/** Delete listing */
export async function removeListing(id /*, reason */) {
  const q = `
    DELETE FROM "Product"
    WHERE product_id = $1
    RETURNING product_id AS id;
  `;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
}
