import request from 'supertest';
import express from 'express';
import productRoutes from '../routes/productRoutes';
import * as productModel from '../models/productModel.js';
import 'dotenv/config';

// Mock the middleware
jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, role: 'seller' };
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

jest.mock('../models/productModel.js');

const app = express();
app.use(express.json());
app.use('/api/product', productRoutes);

describe('Product Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list products', async () => {
    productModel.findProducts.mockResolvedValue([]);
    productModel.countProducts.mockResolvedValue(0);

    const res = await request(app).get('/api/product');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('items', []);
  });

  it('should get a product by id', async () => {
    const product = { id: 1, name: 'Test Product' };
    productModel.findProductById.mockResolvedValue(product);
    productModel.findProductImages.mockResolvedValue([]);

    const res = await request(app).get('/api/product/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should create a product', async () => {
    const newProduct = {
      categoryId: 1,
      name: 'New Product',
      description: 'A great new product',
      price: 100,
      stock: 10,
    };
    productModel.createProduct.mockResolvedValue(2); // Return the ID directly
    productModel.categoryExists.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/product')
      .send(newProduct);
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id', 2);
  });
});
