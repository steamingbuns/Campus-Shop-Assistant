import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/users/register      -> Self-service registration (name, email, password)
router.post('/register', userController.register);

// POST /api/users/login         -> Email/password authentication (returns JWT + profile)
router.post('/login', userController.login);

// POST /api/users/logout        -> Invalidate current JWT (requires Bearer token)
router.post('/logout', authenticate, userController.logout);

// PUT  /api/users/me            -> Update name/address/phone (requires Bearer token)
router.put('/me', authenticate, userController.updateProfile);

// GET  /api/users/me            -> Fetch current user's profile (requires Bearer token)
router.get('/me', authenticate, userController.getCurrentUser);

// POST /api/users/change-password -> Update password with current + new (requires Bearer token)
router.post('/change-password', authenticate, userController.changePassword);

// POST /api/users/refresh       -> Exchange an existing JWT for a new one
router.post('/refresh', userController.refresh_token);

// GET  /api/users/test-token    -> Simple token validity check (requires Bearer token)
router.get('/test-token', authenticate, userController.test_token);

// GET  /api/users/              -> List all users (staff/admin only)
router.get('/', authenticate, authorize(['staff']), userController.getAllUsers);

// GET /api/users/check-review-eligibility/:productId -> Check if user can review a product
router.get('/check-review-eligibility/:productId', authenticate, userController.checkReviewEligibility);

export default router;