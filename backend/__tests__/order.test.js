import request from 'supertest';
import express from 'express';
import orderRoutes from '../routes/orderRoutes';
import * as orderModel from '../models/orderModel.js';
import 'dotenv/config';

// Mock the middleware
let mockCurrentRole = 'user';
jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, role: mockCurrentRole };
    next();
  },
  authorize: (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  },
}));

jest.mock('../models/orderModel.js');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Endpoints', () => {
  beforeEach(() => {
    mockCurrentRole = 'user';
    jest.clearAllMocks();
  });

  it('should create an order', async () => {
    const newOrder = {
      items: [{ productId: 1, quantity: 1 }],
      meetingDetails: { location: 'Library' },
      notes: 'Test order',
    };
    orderModel.createOrder.mockResolvedValue({
      orderId: 1,
      orderCode: 'TESTCODE',
      completionCode: '123456'
    });

    const res = await request(app)
      .post('/api/orders')
      .send(newOrder);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Order created successfully');
    expect(res.body).toHaveProperty('orderId', 1);
  });

  it('should get user orders', async () => {
    const orders = [{ order_id: 1, total_price: 100 }];
    orderModel.findOrdersByBuyerId.mockResolvedValue(orders);

    const res = await request(app).get('/api/orders');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(orders);
  });

  it('rejects order creation without items', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Items array is required and cannot be empty' });
  });

  it('completes order when seller matches', async () => {
    orderModel.findOrderByCompletionCode.mockResolvedValue({ order_id: 5 });
    orderModel.isSellerOfAnyItemInOrder.mockResolvedValue(true);
    orderModel.updateOrderStatus.mockResolvedValue();

    const res = await request(app)
      .put('/api/orders/complete')
      .send({ completion_code: 'ABC' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Order completed successfully', orderId: 5 });
    expect(orderModel.updateOrderStatus).toHaveBeenCalledWith(5, 'completed');
  });

  it('rejects completion without code', async () => {
    const res = await request(app).put('/api/orders/complete').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Completion code is required' });
  });

  it('rejects completion when seller not part of order', async () => {
    orderModel.findOrderByCompletionCode.mockResolvedValue({ order_id: 5 });
    orderModel.isSellerOfAnyItemInOrder.mockResolvedValue(false);

    const res = await request(app)
      .put('/api/orders/complete')
      .send({ completion_code: 'ABC' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'You are not authorized to complete this order' });
  });

  it('returns 404 when completion code not found', async () => {
    orderModel.findOrderByCompletionCode.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/orders/complete')
      .send({ completion_code: 'MISSING' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Order not found or already completed' });
  });

  it('validates status transitions', async () => {
    mockCurrentRole = 'staff';
    orderModel.updateOrderStatus.mockResolvedValue();
    const invalidRes = await request(app)
      .put('/api/orders/1/status')
      .send({ status: 'weird' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error).toContain('Invalid status');

    const okRes = await request(app)
      .put('/api/orders/1/status')
      .send({ status: 'completed' });

    expect(okRes.status).toBe(200);
    expect(okRes.body).toEqual({ message: 'Order status updated to completed' });
    expect(orderModel.updateOrderStatus).toHaveBeenCalledWith('1', 'completed');
  });
});
