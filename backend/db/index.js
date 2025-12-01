import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Basic validation to provide a clearer error when DATABASE_URL is missing/invalid
if (!connectionString || typeof connectionString !== 'string') {
	console.error('Missing DATABASE_URL environment variable. Set DATABASE_URL in backend/.env or your environment.');
	console.error('Example: DATABASE_URL=postgres://user:password@localhost:5432/dbname');
	process.exit(1);
}

if (!/^postgres(?:ql)?:\/\//i.test(connectionString)) {
	console.error('DATABASE_URL does not look like a valid Postgres URL:', connectionString);
	console.error('Expected format: postgres://user:password@host:5432/database');
	process.exit(1);
}

let sql;
try {
	sql = postgres(connectionString);
} catch (err) {
	console.error('Failed to create Postgres client from DATABASE_URL:', connectionString);
	console.error(err && err.stack ? err.stack : err);
	process.exit(1);
}

export default sql;