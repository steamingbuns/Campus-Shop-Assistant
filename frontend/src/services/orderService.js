import api from './api.js';

const orderService = {
  // Create a new order (requires authentication).
  async createOrder(orderData, token) {
    return api.post('/orders', orderData, token);
  },

  // Get all orders for the authenticated user (requires authentication).
  async getUserOrders(token) {
    return api.get('/orders', { token });
  },
};

export default orderService;
