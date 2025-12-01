import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders -> Create a new order (auth required)
router.post('/', authenticate, orderController.createOrder);

// GET /api/orders -> Get all orders for the authenticated user (auth required)
router.get('/', authenticate, orderController.getUserOrders);

router.put('/:orderId/status', authenticate, authorize(['staff']), orderController.updateOrderStatus);

// PUT /api/orders/complete -> Complete an order using the completion code
router.put('/complete', authenticate, orderController.completeOrderByCode);

export default router;
