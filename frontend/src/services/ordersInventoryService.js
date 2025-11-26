import api from './api';

const ordersInventoryService = {
  getSellerOrders: (token) => api.get('/orders-inventory/seller', token),
  updateOrderStatus: (id, status, token) => api.patch(`/orders-inventory/${id}/status`, { status }, token),
};

export default ordersInventoryService;
