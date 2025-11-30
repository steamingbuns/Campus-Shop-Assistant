import request from 'supertest';
import express from 'express';
import productDetailsRoutes from '../routes/productDetailsRoutes.js';
import * as productDetailsModel from '../models/productDetailsModel.js';

jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, _res, next) => {
    req.user = { userId: 7, role: 'seller' };
    next();
  },
}));

jest.mock('../models/productDetailsModel.js');

const app = express();
app.use(express.json());
app.use('/api/product-details', productDetailsRoutes);

describe('Product Details Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/product-details/:id', () => {
    it('returns formatted product when found', async () => {
      productDetailsModel.getProductById.mockResolvedValue({
        id: 3,
        name: 'Notebook',
        price: '12.50',
        description: 'A5 ruled',
        stock: 5,
        rating: '4.2',
        reviewCount: 2,
        category: 'Stationery',
        images: ['one.png'],
        reviews: [{ id: 1, user: 'Ada', rating: 5, comment: 'Nice', date: '2024-01-02' }],
        seller_name: 'Seller',
        seller_email: 's@s.com',
        seller_phone: '123',
        seller_join_date: '2023-01-01',
      });

      const res = await request(app).get('/api/product-details/3');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 3,
        name: 'Notebook',
        price: 12.5,
        rating: 4.2,
        images: ['one.png'],
        reviews: [expect.objectContaining({ user: 'Ada', date: '2024-01-02' })],
        seller: expect.objectContaining({ name: 'Seller', email: 's@s.com' }),
      });
    });

    it('returns 404 when product is missing', async () => {
      productDetailsModel.getProductById.mockResolvedValue(null);

      const res = await request(app).get('/api/product-details/99');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Product not found' });
    });

    it('propagates model errors with 500', async () => {
      productDetailsModel.getProductById.mockRejectedValue(new Error('DB down'));

      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app).get('/api/product-details/2');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Internal server error' });

      // Restore console.error
      consoleError.mockRestore();
    });
  });

  describe('Seller inventory endpoints', () => {
    it('lists seller products', async () => {
      const items = [{ id: 1, name: 'Item' }];
      productDetailsModel.getProductsBySellerId.mockResolvedValue(items);

      const res = await request(app).get('/api/product-details/seller/inventory');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(items);
      expect(productDetailsModel.getProductsBySellerId).toHaveBeenCalledWith(7);
    });

    it('creates a product with sellerId from token', async () => {
      const created = { id: 10, name: 'Bag' };
      productDetailsModel.createProduct.mockResolvedValue(created);

      const res = await request(app)
        .post('/api/product-details')
        .send({ name: 'Bag', price: 20 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(productDetailsModel.createProduct).toHaveBeenCalledWith({ name: 'Bag', price: 20, sellerId: 7 });
    });

    it('updates a product when found', async () => {
      productDetailsModel.updateProduct.mockResolvedValue({ id: 5, name: 'Updated' });

      const res = await request(app)
        .patch('/api/product-details/5')
        .send({ name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 5, name: 'Updated' });
    });

    it('returns 404 when updating missing product', async () => {
      productDetailsModel.updateProduct.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/product-details/404')
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Product not found' });
    });

    it('deletes an existing product', async () => {
      productDetailsModel.deleteProduct.mockResolvedValue(true);

      const res = await request(app).delete('/api/product-details/4');

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
      expect(productDetailsModel.deleteProduct).toHaveBeenCalledWith('4');
    });

    it('returns 404 when delete target missing', async () => {
      productDetailsModel.deleteProduct.mockResolvedValue(null);

      const res = await request(app).delete('/api/product-details/4');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Product not found' });
    });
  });
});
