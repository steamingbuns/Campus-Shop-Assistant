import * as orderModel from '../models/orderModel.js';

export async function createOrder(req, res) {
  try {
    const { items, meetingDetails, notes } = req.body;
    const buyerId = req.user.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    const { orderId, orderCode, completionCode } = await orderModel.createOrder({ buyerId, items, meetingDetails, notes });

    res.status(201).json({ message: 'Order created successfully', orderId, orderCode, completionCode });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export async function getUserOrders(req, res) {
  try {
    const buyerId = req.user.userId;
    const orders = await orderModel.findOrdersByBuyerId(buyerId);
    res.json(orders);
  } catch (error) {
    console.error('getUserOrders error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
}

export async function completeOrderByCode(req, res) {
  try {
    const { completion_code } = req.body;
    const sellerId = req.user.userId;

    if (!completion_code) {
      return res.status(400).json({ error: 'Completion code is required' });
    }

    const order = await orderModel.findOrderByCompletionCode(completion_code);

    if (!order) {
      return res.status(404).json({ error: 'Order not found or already completed' });
    }

    // Authorization: Check if the user is the seller of at least one item in the order
    const isSellerInOrder = await orderModel.isSellerOfAnyItemInOrder(order.order_id, sellerId);
    if (!isSellerInOrder && req.user.role !== 'staff') {
        return res.status(403).json({ error: 'You are not authorized to complete this order' });
    }

    await orderModel.updateOrderStatus(order.order_id, 'completed');

    res.json({ message: 'Order completed successfully', orderId: order.order_id });
  } catch (error) {
    console.error('completeOrderByCode error:', error);
    res.status(500).json({ error: 'Failed to complete order' });
  }
}

export async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Optional: Add validation for allowed status values
        const allowedStatus = ['pending', 'processing', 'completed', 'cancelled'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatus.join(', ')}` });
        }

        await orderModel.updateOrderStatus(orderId, status);

        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
}
