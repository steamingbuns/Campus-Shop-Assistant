import request from 'supertest';
import express from 'express';
import reportRoutes from '../routes/reportRoutes.js';
import * as reportModel from '../models/reportModel.js';
import * as userModel from '../models/userModel.js';
import * as productModel from '../models/productModel.js';

// Mock auth middlewares to always authenticate as admin
jest.mock('../middlewares/auth.js', () => ({
  authenticate: (req, _res, next) => {
    req.user = { userId: 1, role: 'admin' };
    next();
  },
  authorize: () => (_req, _res, next) => next(),
}));

jest.mock('../models/reportModel.js');
jest.mock('../models/userModel.js');
jest.mock('../models/productModel.js');

const app = express();
app.use(express.json());
app.use('/api/report', reportRoutes);

describe('Report Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a report when reporter and item exist', async () => {
    userModel.findUserById.mockResolvedValue({ user_id: 1 });
    productModel.findProductById.mockResolvedValue({ product_id: 10 });
    reportModel.createReport.mockResolvedValue({ report_id: 5, status: 'open' });

    const res = await request(app)
      .post('/api/report')
      .send({ reporter_id: 1, item_id: 10, details: 'Spam listing' });

    expect(res.status).toBe(200);
    expect(reportModel.createReport).toHaveBeenCalledWith(1, 10, 'Spam listing');
    expect(res.body).toHaveProperty('newReport.report_id', 5);
  });

  it('rejects report creation when required ids are missing', async () => {
    const res = await request(app).post('/api/report').send({ details: 'Missing ids' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'reporter_id and item_id are required');
  });

  it('blocks report updates with invalid status', async () => {
    const res = await request(app)
      .put('/api/report/7')
      .send({ newStatus: 'bad-status' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid status value');
  });

  it('updates report status', async () => {
    reportModel.updateReportStatus.mockResolvedValue({ report_id: 7, status: 'resolved' });

    const res = await request(app)
      .put('/api/report/7')
      .send({ newStatus: 'resolved' });

    expect(res.status).toBe(200);
    expect(reportModel.updateReportStatus).toHaveBeenCalledWith('7', 'resolved');
    expect(res.body).toHaveProperty('newStatus', 'resolved');
  });
});
