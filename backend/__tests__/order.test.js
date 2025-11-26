import request from 'supertest';
import express from 'express';
import orderRoutes from '../routes/orderRoutes';
import * as orderModel from '../models/orderModel.js';
import 'dotenv/config';

// Mock the middleware
jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, role: 'user' };
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
});
