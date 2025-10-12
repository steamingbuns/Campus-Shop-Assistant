import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';

const PORT = parseInt(process.env.PORT) || 5000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "http://localhost:5173";
console.log(`Server will run on port: ${PORT}`);
console.log(`CORS allowed origins: ${ALLOWED_ORIGINS}`);

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});