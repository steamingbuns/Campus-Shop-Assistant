import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
// const connectionString = process.env.DATABASE_URL;
// const sql = postgres(connectionString);

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'campus_shop_assistant',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
});

export default sql;