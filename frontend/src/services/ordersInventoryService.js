import api from './api';

const ordersInventoryService = {
  getSellerOrders: () => api.get('/orders-inventory/seller'),
  updateOrderStatus: (id, status) => api.patch(`/orders-inventory/${id}/status`, { status }),
};

export default ordersInventoryService;
