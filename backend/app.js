import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import productDetailsRoutes from './routes/productDetailsRoutes.js';
import ordersInventoryRoutes from './routes/ordersInventoryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const PORT = parseInt(process.env.PORT) || 5000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/product-details', productDetailsRoutes);
app.use('/api/orders-inventory', ordersInventoryRoutes);

export function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

export default app;
