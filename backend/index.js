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
import userRoutes from './routes/userRoutes.js';      // if you have more routes
// import adminRoutes from './routes/adminRoutes.js'; // if you have it

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

const app = express();

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

// Swagger
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerDoc = YAML.load(path.join(__dirname, 'docs', 'openapi.yml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Mount routers at /api so paths match Swagger: /api/auth/login, /api/admin/...
app.use('/api', authRoutes);
app.use('/api', userRoutes);           // if userRoutes contains other /users endpoints
// app.use('/api/admin', adminRoutes); // if present

// health check
app.get('/api/healthz', (_req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use('/api/admin', adminRoutes);