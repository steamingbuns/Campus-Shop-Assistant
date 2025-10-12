import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", authenticate, userController.logout);
router.put("/me", authenticate, userController.updateProfile);
router.get("/me", authenticate, userController.getCurrentUser);
router.post("/change-password", authenticate, userController.changePassword);
router.post("/refresh", userController.refresh_token);
router.get("/test-token", authenticate, userController.test_token);
router.get("/", authenticate, authorize(["staff"]), userController.getAllUsers);

export default router;