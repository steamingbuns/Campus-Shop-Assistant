import request from 'supertest';
import express from 'express';
import ordersInventoryRoutes from '../routes/ordersInventoryRoutes.js';
import * as ordersInventoryModel from '../models/ordersInventoryModel.js';
import * as userModel from '../models/userModel.js';

jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, _res, next) => {
    req.user = { userId: 11, role: 'seller' };
    next();
  },
}));

jest.mock('../models/ordersInventoryModel.js');
jest.mock('../models/userModel.js');

const app = express();
app.use(express.json());
app.use('/api/orders-inventory', ordersInventoryRoutes);

describe('Orders Inventory Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders-inventory/seller', () => {
    it('allows sellers to list their orders', async () => {
      userModel.findUserById.mockResolvedValue({ user_id: 11, role: 'seller' });
      ordersInventoryModel.getOrdersBySellerId.mockResolvedValue([{ order_id: 1 }]);

      const res = await request(app).get('/api/orders-inventory/seller');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ order_id: 1 }]);
      expect(ordersInventoryModel.getOrdersBySellerId).toHaveBeenCalledWith(11);
    });

    it('rejects non-sellers', async () => {
      userModel.findUserById.mockResolvedValue({ user_id: 11, role: 'user' });

      const res = await request(app).get('/api/orders-inventory/seller');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: 'Only sellers can view orders' });
      expect(ordersInventoryModel.getOrdersBySellerId).not.toHaveBeenCalled();
    });

    it('returns 500 on model errors', async () => {
      userModel.findUserById.mockResolvedValue({ user_id: 11, role: 'seller' });
      ordersInventoryModel.getOrdersBySellerId.mockRejectedValue(new Error('db'));

      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).get('/api/orders-inventory/seller');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Internal server error' });

      // Restore console.error
      consoleError.mockRestore();
    });
  });

  describe('PATCH /api/orders-inventory/:id/status', () => {
    it('updates status when order exists', async () => {
      ordersInventoryModel.updateOrderStatus.mockResolvedValue({ order_id: 5, status: 'completed' });

      const res = await request(app)
        .patch('/api/orders-inventory/5/status')
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ order_id: 5, status: 'completed' });
      expect(ordersInventoryModel.updateOrderStatus).toHaveBeenCalledWith('5', 'completed');
    });

    it('returns 404 for missing order', async () => {
      ordersInventoryModel.updateOrderStatus.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/orders-inventory/99/status')
        .send({ status: 'cancelled' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Order not found' });
    });

    it('returns 500 on update error', async () => {
      ordersInventoryModel.updateOrderStatus.mockRejectedValue(new Error('db'));

      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app)
        .patch('/api/orders-inventory/1/status')
        .send({ status: 'pending' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Internal server error' });

      // Restore console.error
      consoleError.mockRestore();
    });
  });
});
