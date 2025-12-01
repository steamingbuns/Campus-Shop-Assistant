import express from 'express';
import { getSellerOrders, updateOrderStatus } from '../controllers/ordersInventoryController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/seller', authenticate, getSellerOrders);
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
