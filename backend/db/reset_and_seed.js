import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, 'schema.sql');

const seedUsers = [
    { name: 'John Doe', email: 'john.doe@example.com', password: 'password123', address: '123 Campus Dr', phone: '555-0101', role: 'seller' },
    { name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password456', address: '456 Dorm Hall', phone: '555-0102', role: 'seller' },
    { name: 'Bob Wilson', email: 'bob.wilson@example.com', password: 'password789', address: '789 Library Ln', phone: '555-0103', role: 'seller' },
    { name: 'Alice Brown', email: 'alice.brown@example.com', password: 'password101', address: '321 Science Ct', phone: '555-0104', role: 'seller' },
    { name: 'Mike Davis', email: 'mike.davis@example.com', password: 'password202', address: '654 Arts Blvd', phone: '555-0105', role: 'seller' },
    { name: 'Campus Admin', email: 'admin@campus.edu', password: 'admin123', address: 'Admin Office', phone: '555-9999', role: 'admin' },
];

async function insertUsers(sql) {
    console.log('Inserting users (hashed)...');
    for (const user of seedUsers) {
        const hash = await bcrypt.hash(user.password, 10);
        await sql`
            INSERT INTO "User" (name, email, password_hash, address, phone_number, role, status)
            VALUES (${user.name}, ${user.email}, ${hash}, ${user.address}, ${user.phone}, ${user.role}, 'active')
            ON CONFLICT (email) DO NOTHING
        `;
    }
    console.log('✓ Users inserted');
}

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('ERROR: DATABASE_URL is not set');
        process.exit(1);
    }

    const sql = postgres(connectionString, { max: 1 });

    try {
        console.log('=== Step 1: Dropping all tables ===');
        await sql`
      DROP TABLE IF EXISTS 
        public."Report",
        public."Message",
        public."Review",
        public."Payment",
        public."Order_Item",
        public."Order",
        public."Cart",
        public."Product_Image",
        public."Product",
        public."Categories",
        public."User"
      CASCADE
    `;
        console.log('✓ All tables dropped\n');

        console.log('=== Step 2: Recreating tables from schema.sql ===');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await sql.unsafe(schema);
        console.log('✓ Schema applied successfully\n');

        console.log('=== Step 3: Seeding data ===');

        await insertUsers(sql);

        // Insert Categories
        console.log('Inserting categories...');
        await sql`
      INSERT INTO "Categories" (name) VALUES
      ('Stationery'),
      ('Books'),
      ('Clothing'),
      ('Electronics'),
      ('Accessories')
    `;
        console.log('✓ Categories inserted');

        // Insert Products
        console.log('Inserting products...');
        await sql`
      INSERT INTO "Product" (seller_id, category_id, name, sku, ratings, stock, low_stock_threshold, description, price, status) VALUES
      (5, 1, 'Unused Notebooks', 'SKU-001', 5, 10, 3, 'Unused Notebooks. Set of 3. Lined paper.', 5.00, 'active'),
      (1, 1, 'Ballpoint Pens', 'SKU-002', 5, 5, 5, 'Pack of Ballpoint Pens. Blue ink.', 3.00, 'active'),
      (3, 1, 'Drawing Kit', 'SKU-003', 4, 1, 2, 'Engineering Drawing Kit. Compass and ruler included.', 12.00, 'active'),
      (2, 1, 'Highlighters Pack', 'SKU-004', 5, 2, 3, 'Highlighters, assorted colors. Pack of 5.', 4.00, 'active'),
      (4, 1, 'Sticky Notes', 'SKU-005', 5, 1, 2, 'Sticky Notes. 3x3 inch. Yellow. 5 pads.', 6.00, 'active'),
      (1, 2, 'Calculus Textbook', 'SKU-006', 4, 1, 1, 'Calculus: Early Transcendentals, 8th Edition. Good condition, some highlighting.', 45.00, 'active'),
      (2, 2, 'CLRS Algorithms', 'SKU-007', 5, 1, 1, 'Introduction to Algorithms (CLRS). Like new, barely used.', 60.00, 'active'),
      (3, 2, 'Organic Chemistry', 'SKU-008', 3, 1, 1, 'Organic Chemistry textbook. Cover is a bit torn but pages are clean.', 30.00, 'active'),
      (1, 2, 'Psychology Course Pack', 'SKU-009', 5, 1, 1, 'Psychology 101 course pack. Includes all lecture notes.', 15.00, 'active'),
      (4, 2, 'Campbell Biology', 'SKU-010', 4, 1, 1, 'Campbell Biology. Heavy book, prefer meet up at library.', 50.00, 'active'),
      (5, 2, 'The Great Gatsby', 'SKU-011', 5, 1, 1, 'The Great Gatsby. Paperback. Required for English Lit.', 8.00, 'active'),
      (2, 2, 'Clean Code', 'SKU-012', 4, 1, 1, 'Clean Code by Robert C. Martin. Essential for CS students.', 25.00, 'active'),
      (3, 3, 'University Hoodie', 'SKU-013', 5, 1, 1, 'University Hoodie, Size M. Navy Blue. Worn twice.', 25.00, 'active'),
      (5, 3, 'Winter Coat', 'SKU-014', 4, 1, 1, 'Winter Coat, Black, Size L. Very warm.', 40.00, 'active'),
      (1, 3, 'Nike Running Shoes', 'SKU-015', 5, 1, 1, 'Nike Running Shoes, Size 10. Brand new in box.', 60.00, 'active'),
      (4, 3, 'Denim Jacket', 'SKU-016', 3, 1, 1, 'Denim Jacket. Vintage look.', 20.00, 'active'),
      (2, 3, 'Graduation Gown', 'SKU-017', 5, 1, 1, 'Graduation Gown and Cap. Height 5ft 8in.', 30.00, 'active'),
      (1, 3, 'Gym Shorts', 'SKU-018', 4, 1, 1, 'Gym Shorts. Size S. Black.', 10.00, 'active'),
      (2, 4, 'Apple AirPods Pro', 'SKU-019', 5, 1, 1, 'Apple AirPods Pro (1st Gen). Cleaned and sanitized. Works perfectly.', 100.00, 'active'),
      (3, 4, 'Wireless Mouse', 'SKU-020', 4, 1, 1, 'Logitech Wireless Mouse. Battery included.', 10.00, 'active'),
      (5, 4, 'TI-84 Plus Calculator', 'SKU-021', 3, 1, 1, 'Scientific Calculator TI-84 Plus. Missing the cover case.', 55.00, 'active'),
      (1, 4, '24 inch Monitor', 'SKU-022', 5, 1, 1, '24 inch Monitor. HDMI cable included. Great for coding.', 80.00, 'active'),
      (4, 4, 'Mechanical Keyboard', 'SKU-023', 4, 1, 1, 'Mechanical Keyboard, Blue switches. Clicky sound.', 40.00, 'active'),
      (2, 4, 'iPad Mini 2 (Parts)', 'SKU-024', 2, 1, 1, 'Old iPad Mini 2. Screen cracked but touch works. Good for parts.', 30.00, 'active'),
      (3, 4, 'USB-C Hub', 'SKU-025', 5, 1, 1, 'USB-C Hub. 7-in-1 adapter. Brand new.', 20.00, 'active'),
      (1, 5, 'Desk Lamp', 'SKU-026', 4, 1, 1, 'IKEA Desk Lamp. White. LED bulb included.', 12.00, 'active'),
      (5, 5, 'Backpack', 'SKU-027', 3, 1, 1, 'Backpack. North Face. Black. Zipper is a bit stiff.', 35.00, 'active'),
      (3, 5, 'Hydro Flask Bottle', 'SKU-028', 5, 1, 1, 'Water Bottle. Hydro Flask 32oz. Blue. No dents.', 20.00, 'active'),
      (2, 5, 'Full Length Mirror', 'SKU-029', 4, 1, 1, 'Full length mirror. No scratches. Must pick up.', 20.00, 'active'),
      (4, 5, 'Tennis Racket', 'SKU-030', 5, 1, 1, 'Tennis Racket. Wilson brand. Grip recently replaced.', 35.00, 'active'),
      (1, 5, 'Yoga Mat', 'SKU-031', 4, 1, 1, 'Yoga Mat. Purple. Non-slip.', 10.00, 'active'),
      (2, 5, 'Umbrella', 'SKU-032', 5, 1, 1, 'Umbrella. Compact. Black. Windproof.', 8.00, 'active')
    `;
        console.log('✓ Products inserted\n');

        // Verify
        console.log('=== Verification ===');
        const catCount = await sql`SELECT COUNT(*) as count FROM "Categories"`;
        const userCount = await sql`SELECT COUNT(*) as count FROM "User"`;
        const prodCount = await sql`SELECT COUNT(*) as count FROM "Product"`;
        console.log(`Categories: ${catCount[0].count}`);
        console.log(`Users: ${userCount[0].count}`);
        console.log(`Products: ${prodCount[0].count}`);

        console.log('\n✅ Database recreated and seeded successfully!');

    } catch (err) {
        console.error('\n❌ Failed:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.hint) console.error('Hint:', err.hint);
        process.exitCode = 1;
    } finally {
        await sql.end({ timeout: 5 });
    }
}

main();
