import sql from '../db/index.js';

export async function listAllTransactions() {
  const rows = await sql`
    SELECT
      o.order_id,
      COALESCE(buyer.name, buyer.email)     AS buyer_name,
      COALESCE(seller.name, seller.email)   AS seller_name,
      COALESCE(p.name, p.description)       AS product_title,
      o.total_price AS amount,
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
  `;
  return rows;
}

export default { listAllTransactions };
