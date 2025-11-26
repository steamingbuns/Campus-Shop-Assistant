import api from './api';

const orderService = {
  // Buyer: get own orders
  getUserOrders: (token) => api.get('/orders', token),

  // Buyer: create order
  createOrder: (payload, token) => api.post('/orders', payload, token),

  // Seller: complete order by code
  completeOrder: (payload, token) => api.put('/orders/complete', payload, token),
};

export default orderService;
