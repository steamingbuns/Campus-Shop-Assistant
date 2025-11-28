// backend/routes/adminRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import {
  getUsers,
  postWarnUser,
  postSuspendUser,
  postUnsuspendUser,
  getListings,
  postApproveListing,
  putEditListing,
  deleteListing,
  getTransactions
} from '../controllers/adminController.js';

const router = express.Router();

/** Middleware: chấp nhận JWT từ header Authorization: Bearer ... (và fallback cookie).
 *  Yêu cầu role = 'admin'
 */
function requireAdminFromBearer(req, res, next) {
  try {
    let token = null;

    // 1) Header Bearer
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer ')) token = auth.slice(7).trim();

    // 2) Fallback Cookie
    if (!token && req.cookies) token = req.cookies.token || req.cookies.jwt;

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// (Tuỳ chọn) route ping để test auth nhanh
router.get('/ping', requireAdminFromBearer, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// ===== Users =====
router.get('/users', requireAdminFromBearer, getUsers);
router.post('/users/:id/warn', requireAdminFromBearer, postWarnUser);
router.post('/users/:id/suspend', requireAdminFromBearer, postSuspendUser);
router.post('/users/:id/unsuspend', requireAdminFromBearer, postUnsuspendUser);

// ===== Listings =====
router.get('/listings', requireAdminFromBearer, getListings);
router.post('/listings/:id/approve', requireAdminFromBearer, postApproveListing);
router.put('/listings/:id', requireAdminFromBearer, putEditListing);
router.delete('/listings/:id', requireAdminFromBearer, deleteListing);

// ===== Transactions =====
router.get('/transactions', requireAdminFromBearer, getTransactions);

export default router;
