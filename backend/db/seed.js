import dotenv from 'dotenv';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not set. Add it to backend/.env');
    process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

const seedUsers = [
    { name: 'John Doe', email: 'john.doe@example.com', password: 'password123', address: '123 Campus Dr', phone: '555-0101', role: 'seller' },
    { name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password456', address: '456 Dorm Hall', phone: '555-0102', role: 'seller' },
    { name: 'Bob Wilson', email: 'bob.wilson@example.com', password: 'password789', address: '789 Library Ln', phone: '555-0103', role: 'seller' },
    { name: 'Alice Brown', email: 'alice.brown@example.com', password: 'password101', address: '321 Science Ct', phone: '555-0104', role: 'seller' },
    { name: 'Mike Davis', email: 'mike.davis@example.com', password: 'password202', address: '654 Arts Blvd', phone: '555-0105', role: 'seller' },
];

async function insertUsers() {
    console.log('Inserting users (hashed passwords)...');
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
    try {
        console.log('Seeding database...');

        // 1. Insert Users (via hashing like register)
        await insertUsers();

        // 2. Insert Categories
        console.log('Inserting categories...');
        await sql`
      INSERT INTO "Categories" (name) VALUES
      ('Stationery'),
      ('Books'),
      ('Clothing'),
      ('Electronics'),
      ('Accessories')
    `;

        // 3. Insert Products
        console.log('Inserting products...');
        await sql`
      INSERT INTO "Product" (seller_id, category_id, ratings, stock, description, price, status) VALUES
      (5, 1, 5, 10, 'Unused Notebooks. Set of 3. Lined paper.', 5.00, 'active'),
      (1, 1, 5, 5, 'Pack of Ballpoint Pens. Blue ink.', 3.00, 'active'),
      (3, 1, 4, 1, 'Engineering Drawing Kit. Compass and ruler included.', 12.00, 'active'),
      (2, 1, 5, 2, 'Highlighters, assorted colors. Pack of 5.', 4.00, 'active'),
      (4, 1, 5, 1, 'Sticky Notes. 3x3 inch. Yellow. 5 pads.', 6.00, 'active'),
      (1, 2, 4, 1, 'Calculus: Early Transcendentals, 8th Edition. Good condition, some highlighting.', 45.00, 'active'),
      (2, 2, 5, 1, 'Introduction to Algorithms (CLRS). Like new, barely used.', 60.00, 'active'),
      (3, 2, 3, 1, 'Organic Chemistry textbook. Cover is a bit torn but pages are clean.', 30.00, 'active'),
      (1, 2, 5, 1, 'Psychology 101 course pack. Includes all lecture notes.', 15.00, 'active'),
      (4, 2, 4, 1, 'Campbell Biology. Heavy book, prefer meet up at library.', 50.00, 'active'),
      (5, 2, 5, 1, 'The Great Gatsby. Paperback. Required for English Lit.', 8.00, 'active'),
      (2, 2, 4, 1, 'Clean Code by Robert C. Martin. Essential for CS students.', 25.00, 'active'),
      (3, 3, 5, 1, 'University Hoodie, Size M. Navy Blue. Worn twice.', 25.00, 'active'),
      (5, 3, 4, 1, 'Winter Coat, Black, Size L. Very warm.', 40.00, 'active'),
      (1, 3, 5, 1, 'Nike Running Shoes, Size 10. Brand new in box.', 60.00, 'active'),
      (4, 3, 3, 1, 'Denim Jacket. Vintage look.', 20.00, 'active'),
      (2, 3, 5, 1, 'Graduation Gown and Cap. Height 5ft 8in.', 30.00, 'active'),
      (1, 3, 4, 1, 'Gym Shorts. Size S. Black.', 10.00, 'active'),
      (2, 4, 5, 1, 'Apple AirPods Pro (1st Gen). Cleaned and sanitized. Works perfectly.', 100.00, 'active'),
      (3, 4, 4, 1, 'Logitech Wireless Mouse. Battery included.', 10.00, 'active'),
      (5, 4, 3, 1, 'Scientific Calculator TI-84 Plus. Missing the cover case.', 55.00, 'active'),
      (1, 4, 5, 1, '24 inch Monitor. HDMI cable included. Great for coding.', 80.00, 'active'),
      (4, 4, 4, 1, 'Mechanical Keyboard, Blue switches. Clicky sound.', 40.00, 'active'),
      (2, 4, 2, 1, 'Old iPad Mini 2. Screen cracked but touch works. Good for parts.', 30.00, 'active'),
      (3, 4, 5, 1, 'USB-C Hub. 7-in-1 adapter. Brand new.', 20.00, 'active'),
      (1, 5, 4, 1, 'IKEA Desk Lamp. White. LED bulb included.', 12.00, 'active'),
      (5, 5, 3, 1, 'Backpack. North Face. Black. Zipper is a bit stiff.', 35.00, 'active'),
      (3, 5, 5, 1, 'Water Bottle. Hydro Flask 32oz. Blue. No dents.', 20.00, 'active'),
      (2, 5, 4, 1, 'Full length mirror. No scratches. Must pick up.', 20.00, 'active'),
      (4, 5, 5, 1, 'Tennis Racket. Wilson brand. Grip recently replaced.', 35.00, 'active'),
      (1, 5, 4, 1, 'Yoga Mat. Purple. Non-slip.', 10.00, 'active'),
      (2, 5, 5, 1, 'Umbrella. Compact. Black. Windproof.', 8.00, 'active')
    `;

        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Failed to seed database:');
        console.error('Error:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.hint) console.error('Hint:', err.hint);
        process.exitCode = 1;
    } finally {
        await sql.end({ timeout: 5 });
    }
}

main();
