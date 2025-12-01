import request from 'supertest';
import express from 'express';
import healthRoutes from '../routes/healthRoutes.js';

const app = express();
app.use('/health', healthRoutes);

describe('Health Route', () => {
  it('returns ok payload', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});
