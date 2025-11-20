import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resetPath = path.join(__dirname, 'reset_db.sql');
const schemaPath = path.join(__dirname, 'schema.sql');

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('ERROR: DATABASE_URL is not set. Add it to backend/.env');
        process.exit(1);
    }

    const sql = postgres(connectionString, { max: 1 });

    try {
        // Drop all tables
        const resetSql = fs.readFileSync(resetPath, 'utf8');
        console.log('Dropping tables from', resetPath);
        await sql.unsafe(resetSql);

        // Recreate tables from schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('Recreating tables from', schemaPath);
        await sql.unsafe(schema);

        console.log('Database reset successfully.');
    } catch (err) {
        console.error('Failed to reset database:', err);
        console.error('Error code:', err.code);
        console.error('Error detail:', err.detail);
        process.exitCode = 1;
    } finally {
        await sql.end({ timeout: 5 });
    }
}

main();
