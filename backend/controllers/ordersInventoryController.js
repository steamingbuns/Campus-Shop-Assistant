import { getOrdersBySellerId, updateOrderStatus as updateOrderStatusModel } from '../models/ordersInventoryModel.js';
import * as userModel from '../models/userModel.js';

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const user = await userModel.findUserById(sellerId);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can view orders' });
    }
    if (!sellerId) {
      console.error('Seller ID missing in request user');
      return res.status(400).json({ message: 'User ID missing' });
    }
    const orders = await getOrdersBySellerId(sellerId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await updateOrderStatusModel(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
