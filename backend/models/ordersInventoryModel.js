import sql from '../db/index.js';

export const getOrdersBySellerId = async (sellerId) => {
  // Fetch orders that contain products from this seller
  const orders = await sql`
    SELECT 
      o.order_id as id,
      u.name as customer,
      u.email,
      SUM(oi.price * oi.quantity) as total,
      o.status as status,
      o.create_at as date,
      o.meeting_details,
      o.notes,
      json_agg(json_build_object(
        'name', p.name,
        'quantity', oi.quantity,
        'price', oi.price
      )) as items
    FROM public."Order" o
    JOIN public."User" u ON o.buyer_id = u.user_id
    JOIN public."Order_Item" oi ON o.order_id = oi.order_id
    JOIN public."Product" p ON oi.item_id = p.product_id
    WHERE p.seller_id = ${sellerId}
    GROUP BY o.order_id, u.name, u.email, o.status, o.create_at, o.meeting_details, o.notes
    ORDER BY o.create_at DESC
  `;
  
  return orders;
};

export const updateOrderStatus = async (orderId, status) => {
  const updated = await sql`
    UPDATE public."Order"
    SET status = ${status}
    WHERE order_id = ${orderId}
    RETURNING order_id, status
  `;
  return updated[0];
};
