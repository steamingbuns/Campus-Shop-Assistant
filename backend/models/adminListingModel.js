import sql from '../db/index.js';

/** List listings (optional filter by status) */
export async function listListings(status) {
  const params = [];
  let where = sql``;
  if (status && status !== 'all') { 
    where = sql`WHERE status = ${status}`; 
  }

  const rows = await sql`
    SELECT
      p.product_id AS id,
      p.name AS name,
      p.name AS title,
      p.description AS description,
      p.price AS price,
      p.stock AS stock,
      p.status AS status,
      p.create_at AS created_at,
      COALESCE(u.name, u.email) AS seller_name
    FROM "Product" p
    LEFT JOIN "User" u ON p.seller_id = u.user_id
    ${where}
    ORDER BY product_id DESC
  `;
  return rows;
}

/** Approve listing: set status = 'active' and return row */
export async function approveListing(id) {
  const rows = await sql`
    UPDATE "Product"
    SET status = 'active', updated_at = NOW()
    WHERE product_id = ${id}
    RETURNING
      product_id AS id,
      name AS title,
      description,
      price,
      stock,
      status,
      updated_at
  `;
  return rows[0] || null;
}

/** Edit listing (cho phép sửa name/description/price/stock/status) */
export async function editListing(id, payload = {}) {
  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.price !== undefined) updates.price = payload.price;
  if (payload.stock !== undefined) updates.stock = payload.stock;
  if (payload.status !== undefined) updates.status = payload.status;

  if (Object.keys(updates).length === 0) {
    // If no updates, just return the current listing
    const currentListing = await sql`
      SELECT
        product_id AS id,
        name AS title,
        description,
        price,
        stock,
        status,
        updated_at
      FROM "Product"
      WHERE product_id = ${id}
    `;
    return currentListing[0] || null;
  }

  const rows = await sql`
    UPDATE "Product"
    SET ${sql(updates)}, updated_at = NOW()
    WHERE product_id = ${id}
    RETURNING
      product_id AS id,
      name AS title,
      description,
      price,
      stock,
      status,
      updated_at
  `;
  return rows[0] || null;
}

/** Delete listing */
export async function removeListing(id /*, reason */) {
  const rows = await sql`
    DELETE FROM "Product"
    WHERE product_id = ${id}
    RETURNING product_id AS id
  `;
  return rows[0] || null;
}
