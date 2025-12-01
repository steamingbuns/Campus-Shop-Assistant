import sql from '../db/index.js';

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;

async function generateUniqueCode(trx, tableName, columnName) {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length));
    }
    const [existing] = await trx`
      SELECT 1 FROM "Order" WHERE ${sql(columnName)} = ${code}
    `;
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
}

export async function createOrder({ buyerId, items, meetingDetails, notes }) {
  let orderDetails;
  let total = 0;

  // Calculate total price from items
  for (const item of items) {
    const [product] = await sql`
      SELECT price FROM "Product" WHERE product_id = ${item.productId}
    `;
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    total += product.price * item.quantity;
  }

  await sql.begin(async (trx) => {
    const orderCode = await generateUniqueCode(trx, 'Order', 'order_code');
    const completionCode = await generateUniqueCode(trx, 'Order', 'completion_code');

    const [order] = await trx`
      INSERT INTO "Order" (buyer_id, status, total_price, meeting_details, notes, create_at, order_code, completion_code)
      VALUES (${buyerId}, 'pending', ${total}, ${sql.json(meetingDetails)}, ${notes}, NOW(), ${orderCode}, ${completionCode})
      RETURNING order_id, order_code, completion_code
    `;

    orderDetails = {
      orderId: order.order_id,
      orderCode: order.order_code,
      completionCode: order.completion_code
    };

    for (const item of items) {
      const [product] = await trx`
        SELECT price FROM "Product" WHERE product_id = ${item.productId}
      `;
      await trx`
        INSERT INTO "Order_Item" (order_id, item_id, quantity, price)
        VALUES (${orderDetails.orderId}, ${item.productId}, ${item.quantity}, ${product.price})
      `;
    }
  });

  return orderDetails;
}

export async function findOrdersByBuyerId(buyerId) {
  const orders = await sql`
    SELECT
      o.order_id,
      o.status AS order_status,
      o.total_price,
      o.create_at,
      o.order_code,
      o.completion_code,
      o.meeting_details,
      o.notes,
      json_agg(
        json_build_object(
          'productId', p.product_id,
          'name', p.description,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items
    FROM "Order" o
    JOIN "Order_Item" oi ON o.order_id = oi.order_id
    JOIN "Product" p ON oi.item_id = p.product_id
    WHERE o.buyer_id = ${buyerId}
    GROUP BY o.order_id
    ORDER BY o.create_at DESC
  `;
  return orders;
}

export async function findOrderByCompletionCode(completionCode) {
  const [order] = await sql`
    SELECT order_id, status FROM "Order" 
    WHERE completion_code = ${completionCode} AND status != 'completed'
  `;
  return order;
}

export async function isSellerOfAnyItemInOrder(orderId, sellerId) {
    const [result] = await sql`
        SELECT 1 FROM "Order_Item" oi
        JOIN "Product" p ON oi.item_id = p.product_id
        WHERE oi.order_id = ${orderId} AND p.seller_id = ${sellerId}
        LIMIT 1
    `;
    return !!result;
}

export async function updateOrderStatus(orderId, status) {
  await sql`
    UPDATE "Order" SET status = ${status} WHERE order_id = ${orderId}
  `;
}
