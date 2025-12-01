import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as productController from '../controllers/productController.js';

const router = express.Router();

// GET /api/product                -> Paginated catalog with optional filters (?q, categoryId, minPrice, maxPrice, sort, page, pageSize)
router.get('/', productController.listProducts);

// GET /api/product/categories     -> Category tree plus active product counts
router.get('/categories', productController.listCategories);

// GET /api/product/:id            -> Full product detail, seller info, rating summary
router.get('/:id', productController.getProductById);

// GET /api/product/:id/images     -> Ordered image gallery for a product
router.get('/:id/images', productController.getProductImages);

// GET /api/product/:id/reviews    -> Buyer reviews for a product, newest first
router.get('/:id/reviews', productController.getProductReviews);

// POST /api/product               -> Create product (seller/staff/admin, Bearer token)
router.post('/', authenticate, authorize(['seller', 'staff', 'admin']), productController.createProduct);

// PUT /api/product/:id            -> Update product metadata (seller can only update own)
router.put('/:id', authenticate, authorize(['seller', 'staff', 'admin']), productController.updateProduct);

// PATCH /api/product/:id/stock    -> Adjust inventory level (seller/staff/admin)
router.patch('/:id/stock', authenticate, authorize(['seller', 'staff', 'admin']), productController.updateProductStock);

// PATCH /api/product/stock/decrease -> Decrease stock for multiple products (auth required)
router.patch('/stock/decrease', authenticate, productController.decreaseProductStock);

// DELETE /api/product/:id         -> Remove a product (staff/admin only)
router.delete('/:id', authenticate, authorize(['staff', 'admin']), productController.deleteProduct);

// POST /api/product/:id/images    -> Attach an image URL (seller/staff/admin, owns product)
router.post('/:id/images', authenticate, authorize(['seller', 'staff', 'admin']), productController.addProductImage);

// DELETE /api/product/:id/images/:imageId -> Remove a specific image (seller owner or staff/admin)
router.delete('/:id/images/:imageId', authenticate, authorize(['seller', 'staff', 'admin']), productController.deleteProductImage);

// POST /api/product/:id/reviews   -> Buyer review tied to an order (auth required)
router.post('/:id/reviews', authenticate, productController.addProductReview);

// PUT /api/product/:id/reviews/:reviewId -> Update own review (or staff/admin)
router.put('/:id/reviews/:reviewId', authenticate, productController.updateProductReview);

// DELETE /api/product/:id/reviews/:reviewId -> Remove review (staff/admin only)
router.delete('/:id/reviews/:reviewId', authenticate, authorize(['staff', 'admin']), productController.deleteProductReview);

export default router;
