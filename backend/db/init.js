import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'schema.sql');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not set. Add it to backend/.env');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying schema from', schemaPath);
    // Use unsafe to execute full SQL script with multiple statements
    await sql.unsafe(schema);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to apply schema:', err);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
