import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productDetailsRoutes from './routes/productDetailsRoutes.js';
import ordersInventoryRoutes from './routes/ordersInventoryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5432',
  'http://127.0.0.1:5432',
];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins])
);

const allowAllOrigins = (process.env.NODE_ENV || 'development') !== 'production';

console.log(`Server will run on port: ${PORT}`);
console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
if (allowAllOrigins) {
  console.log('CORS is permissive because NODE_ENV is not production.');
}

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin) || allowAllOrigins) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

// Swagger
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerDoc = YAML.load(path.join(__dirname, 'docs', 'openapi.yml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/report", reportRoutes);
app.use('/api/product-details', productDetailsRoutes);
app.use('/api/orders-inventory', ordersInventoryRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.get('/api/healthz', (_req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
