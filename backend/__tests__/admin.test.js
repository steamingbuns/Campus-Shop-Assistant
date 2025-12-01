import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/adminRoutes.js';
import * as adminUserModel from '../models/adminUserModel.js';
import * as adminListingModel from '../models/adminListingModel.js';
import * as adminOrderModel from '../models/adminOrderModel.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('../models/adminUserModel.js');
jest.mock('../models/adminListingModel.js');
jest.mock('../models/adminOrderModel.js');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

const adminToken = 'token';

const authorizeAs = (role = 'admin') => {
  jwt.verify.mockReturnValue({ userId: 99, role });
};

describe('Admin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects missing bearer token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Authentication required' });
  });

  it('rejects non-admin roles', async () => {
    authorizeAs('seller');
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Admin only' });
  });

  describe('Users', () => {
    it('lists users', async () => {
      authorizeAs();
      adminUserModel.listAllUsers.mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
    });

    it('warns a user and handles not allowed', async () => {
      authorizeAs();
      adminUserModel.warnUser
        .mockResolvedValueOnce({ id: 1, warnings: 1 })
        .mockResolvedValueOnce(null);

      const okRes = await request(app)
        .post('/api/admin/users/1/warn')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ message: 'Be nice' });
      expect(okRes.status).toBe(200);
      expect(okRes.body).toEqual({ ok: true, user: { id: 1, warnings: 1 } });

      const forbiddenRes = await request(app)
        .post('/api/admin/users/2/warn')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(forbiddenRes.status).toBe(403);
      expect(forbiddenRes.body).toEqual({ ok: false, error: 'Not allowed or user not found' });
    });

    it('suspends and unsuspends users', async () => {
      authorizeAs();
      adminUserModel.suspendUser.mockResolvedValue({ id: 2, status: 'suspended' });
      adminUserModel.unsuspendUser.mockResolvedValue({ id: 2, status: 'active' });

      const suspendRes = await request(app)
        .post('/api/admin/users/2/suspend')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'spam' });
      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.user).toMatchObject({ status: 'suspended' });

      const unsuspendRes = await request(app)
        .post('/api/admin/users/2/unsuspend')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(unsuspendRes.status).toBe(200);
      expect(unsuspendRes.body.user).toMatchObject({ status: 'active' });
    });
  });

  describe('Listings', () => {
    beforeEach(() => authorizeAs());

    it('lists pending listings with optional status filter', async () => {
      adminListingModel.listListings.mockResolvedValue([{ id: 3, status: 'pending' }]);

      const res = await request(app)
        .get('/api/admin/listings')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(adminListingModel.listListings).toHaveBeenCalledWith('pending');
      expect(res.body).toEqual([{ id: 3, status: 'pending' }]);
    });

    it('approves listing or returns 404', async () => {
      adminListingModel.approveListing
        .mockResolvedValueOnce({ id: 5, status: 'approved' })
        .mockResolvedValueOnce(null);

      const okRes = await request(app)
        .post('/api/admin/listings/5/approve')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(okRes.status).toBe(200);
      expect(okRes.body).toEqual({ ok: true, listing: { id: 5, status: 'approved' } });

      const missingRes = await request(app)
        .post('/api/admin/listings/6/approve')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(missingRes.status).toBe(404);
      expect(missingRes.body).toEqual({ ok: false, error: 'Listing not found' });
    });

    it('edits or deletes a listing and returns 404 when absent', async () => {
      adminListingModel.editListing.mockResolvedValueOnce({ id: 7, name: 'updated' }).mockResolvedValueOnce(null);
      adminListingModel.removeListing.mockResolvedValueOnce({ id: 8 }).mockResolvedValueOnce(null);

      const editOk = await request(app)
        .put('/api/admin/listings/7')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'updated' });
      expect(editOk.status).toBe(200);
      expect(editOk.body).toEqual({ ok: true, listing: { id: 7, name: 'updated' } });

      const editMissing = await request(app)
        .put('/api/admin/listings/9')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(editMissing.status).toBe(404);

      const deleteOk = await request(app)
        .delete('/api/admin/listings/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'spam' });
      expect(deleteOk.status).toBe(200);
      expect(deleteOk.body).toEqual({ ok: true, listing: { id: 8 } });

      const deleteMissing = await request(app)
        .delete('/api/admin/listings/10')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteMissing.status).toBe(404);
    });
  });

  describe('Transactions', () => {
    it('returns transactions and handles failures', async () => {
      authorizeAs();
      adminOrderModel.listAllTransactions
        .mockResolvedValueOnce([{ id: 1 }])
        .mockRejectedValueOnce(new Error('db'));

      const okRes = await request(app).get('/api/admin/transactions').set('Authorization', `Bearer ${adminToken}`);
      expect(okRes.status).toBe(200);
      expect(okRes.body).toEqual([{ id: 1 }]);

      const errRes = await request(app).get('/api/admin/transactions').set('Authorization', `Bearer ${adminToken}`);
      expect(errRes.status).toBe(500);
      expect(errRes.body).toHaveProperty('error');
    });
  });

  it('returns 401 when JWT verification throws', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid or expired token' });
  });
});
