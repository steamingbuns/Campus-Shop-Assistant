import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function listAllTransactions() {
  const q = `
    SELECT
      o.order_id,
      COALESCE(buyer.name, buyer.email)     AS buyer_name,
      COALESCE(seller.name, seller.email)   AS seller_name,
      COALESCE(p.name, p.description)       AS product_title,
      COALESCE(o.total_price, SUM(oi.price * oi.quantity)) AS amount,
      o.status,
      o.create_at AS created_at
    FROM "Order" o
    LEFT JOIN "User" buyer ON o.buyer_id = buyer.user_id
    LEFT JOIN "Order_Item" oi ON o.order_id = oi.order_id
    LEFT JOIN "Product" p ON oi.item_id = p.product_id
    LEFT JOIN "User" seller ON p.seller_id = seller.user_id
    GROUP BY
      o.order_id,
      buyer.name, buyer.email,
      seller.name, seller.email,
      p.name, p.description,
      o.total_price, o.status, o.create_at
    ORDER BY o.order_id DESC
    LIMIT 200;
  `;
  const { rows } = await pool.query(q);
  return rows;
}

export default { listAllTransactions };
