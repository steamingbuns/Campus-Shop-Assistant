import express from 'express';
import { 
  getProduct, 
  getSellerProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productDetailsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes (Seller) - put specific routes before parameterized
router.get('/seller/inventory', authenticate, getSellerProducts);
router.post('/', authenticate, createProduct);
router.patch('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

// Public routes
router.get('/:id', getProduct);

export default router;
