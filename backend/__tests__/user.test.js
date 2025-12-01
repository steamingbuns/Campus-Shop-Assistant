import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/userRoutes';
import * as userModel from '../models/userModel.js';
import 'dotenv/config';

jest.mock('../models/userModel.js');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Endpoints', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    userModel.findUserByEmail.mockResolvedValue(null);
    userModel.createUser.mockResolvedValue({
      user_id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'seller'
    });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register a user with an existing email', async () => {
    userModel.findUserByEmail.mockResolvedValue({ email: 'test1@example.com' });
    
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Another User',
        email: 'test1@example.com',
        password: 'password456',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });

  it('should login a registered user', async () => {
    const hashedPassword = await import('bcrypt').then(bcrypt => bcrypt.hash('password123', 10));
    userModel.findUserByEmail.mockResolvedValue({
      user_id: 1,
      email: 'login@example.com',
      password_hash: hashedPassword,
      status: 'active',
      role: 'seller'
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with incorrect password', async () => {
    const hashedPassword = await import('bcrypt').then(bcrypt => bcrypt.hash('password123', 10));
    userModel.findUserByEmail.mockResolvedValue({
      user_id: 1,
      email: 'loginfail@example.com',
      password_hash: hashedPassword,
      status: 'active'
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'loginfail@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Invalid email or password');
  });
});
