import request from 'supertest';
import express from 'express';
import productRoutes from '../routes/productRoutes';
import * as productModel from '../models/productModel.js';
import 'dotenv/config';

// Mock the middleware
jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, role: 'admin' };
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

  it('should update a product', async () => {
    const updatedProduct = {
      name: 'Updated Product',
      price: 150,
    };
    productModel.getProductOwnership.mockResolvedValue({ id: 1, seller_id: 1 });
    productModel.categoryExists.mockResolvedValue(true);
    productModel.updateProduct.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .put('/api/product/1')
      .send(updatedProduct);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should delete a product', async () => {
    productModel.deleteProduct.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete('/api/product/1');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should update product stock', async () => {
    const newStock = { stock: 50 };
    productModel.getProductOwnership.mockResolvedValue({ id: 1, seller_id: 1 });
    productModel.updateProductStock.mockResolvedValue({ id: 1, stock: 50 });

    const res = await request(app)
      .patch('/api/product/1/stock')
      .send(newStock);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('stock', 50);
  });

  it('should decrease product stock', async () => {
    const items = [{ productId: 1, quantity: 1 }];
    productModel.findProductById.mockResolvedValue({ id: 1, stock: 10 });
    productModel.decreaseProductStock.mockResolvedValue();

    const res = await request(app)
      .patch('/api/product/stock/decrease')
      .send({ items });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product stocks decreased successfully');
  });

  it('should return an error when decreasing product stock with insufficient stock', async () => {
    const items = [{ productId: 1, quantity: 10 }];
    productModel.findProductById.mockResolvedValue({ id: 1, name: 'Test Product', stock: 5 });

    const res = await request(app)
      .patch('/api/product/stock/decrease')
      .send({ items });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Not enough stock for product Test Product');
  });

  it('should list categories', async () => {
    const categories = [
      { id: 1, name: 'Electronics', parent_category_id: null, product_count: '5' },
      { id: 2, name: 'Books', parent_category_id: null, product_count: '10' },
    ];
    productModel.getCategoriesWithCounts.mockResolvedValue(categories);

    const res = await request(app).get('/api/product/categories');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('categories', [
      { id: 1, name: 'Electronics', parentCategoryId: null, productCount: 5 },
      { id: 2, name: 'Books', parentCategoryId: null, productCount: 10 },
    ]);
  });

  it('should get product images', async () => {
    const images = [
      { image_id: 1, image_url: 'http://example.com/image1.jpg' },
      { image_id: 2, image_url: 'http://example.com/image2.jpg' },
    ];
    productModel.productExists.mockResolvedValue(true);
    productModel.findProductImages.mockResolvedValue(images);

    const res = await request(app).get('/api/product/1/images');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('images', [
      { id: 1, url: 'http://example.com/image1.jpg' },
      { id: 2, url: 'http://example.com/image2.jpg' },
    ]);
  });

  it('should get product reviews', async () => {
    const reviews = [
      { id: 1, item_id: 1, user_id: 1, user_name: 'John Doe', order_id: 1, rating: 5, comment: 'Great product!', create_at: '2025-11-30T10:00:00.000Z' },
    ];
    productModel.productExists.mockResolvedValue(true);
    productModel.findProductReviews.mockResolvedValue(reviews);

    const res = await request(app).get('/api/product/1/reviews');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('reviews', [
      { id: 1, itemId: 1, userId: 1, userName: 'John Doe', orderId: 1, rating: 5, comment: 'Great product!', createdAt: '2025-11-30T10:00:00.000Z' },
    ]);
  });

  it('should add a product image', async () => {
    const newImage = { image_url: 'http://example.com/image3.jpg' };
    const createdImage = { id: 3, image_url: 'http://example.com/image3.jpg' };
    productModel.getProductOwnership.mockResolvedValue({ id: 1, seller_id: 1 });
    productModel.createProductImage.mockResolvedValue(createdImage);

    const res = await request(app)
      .post('/api/product/1/images')
      .send(newImage);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Image added');
    expect(res.body).toHaveProperty('image', {
      id: 3,
      url: 'http://example.com/image3.jpg',
    });
  });

  it('should delete a product image', async () => {
    productModel.getProductImageWithSeller.mockResolvedValue({ id: 1, seller_id: 1 });
    productModel.deleteProductImage.mockResolvedValue();

    const res = await request(app)
      .delete('/api/product/1/images/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Image deleted');
    expect(res.body).toHaveProperty('imageId', 1);
  });

  it('should add a product review', async () => {
    const review = { rating: 5, comment: 'Excellent!' };
    const createdReview = { id: 1, ...review, create_at: '2025-11-30T11:00:00.000Z' };
    productModel.productExists.mockResolvedValue(true);
    productModel.findCompletedOrderForProductByUser.mockResolvedValue({ order_id: 1 });
    productModel.hasReviewForOrder.mockResolvedValue(false);
    productModel.createProductReview.mockResolvedValue(createdReview);

    const res = await request(app)
      .post('/api/product/1/reviews')
      .send(review);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Review added');
    expect(res.body).toHaveProperty('review');
    expect(res.body.review).toHaveProperty('rating', 5);
  });

  it('should not add a product review if the user has not purchased the product', async () => {
    const review = { rating: 5, comment: 'Excellent!' };
    productModel.productExists.mockResolvedValue(true);
    productModel.findCompletedOrderForProductByUser.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/product/1/reviews')
      .send(review);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'You can only review products you have purchased and received.');
  });

  it('should update a product review', async () => {
    const updatedReviewData = { rating: 4 };
    const existingReview = { id: 1, user_id: 1, rating: 5, comment: 'Excellent!' };
    const updatedReview = { ...existingReview, ...updatedReviewData };
    productModel.findReviewById.mockResolvedValue(existingReview);
    productModel.updateReview.mockResolvedValue(updatedReview);

    const res = await request(app)
      .put('/api/product/1/reviews/1')
      .send(updatedReviewData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Review updated');
    expect(res.body).toHaveProperty('review');
    expect(res.body.review).toHaveProperty('rating', 4);
  });

  it('should delete a product review', async () => {
    productModel.deleteReview.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete('/api/product/1/reviews/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Review deleted');
    expect(res.body).toHaveProperty('reviewId', 1);
  });
});
