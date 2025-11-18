import sql from './index.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [user1] = await sql`
      INSERT INTO "User" (name, email, password_hash, role, phone_number)
      VALUES ('Test User', 'user@test.com', ${hashedPassword}, 'user', '0123456789')
      RETURNING user_id
    `;

    const [seller1] = await sql`
      INSERT INTO "User" (name, email, password_hash, role, phone_number)
      VALUES ('Test Seller', 'seller@test.com', ${hashedPassword}, 'seller', '0987654321')
      RETURNING user_id
    `;

    console.log('✅ Users created');

    // 2. Ensure categories exist
    const categories = await sql`SELECT * FROM "Categories"`;
    if (categories.length === 0) {
      await sql`
        INSERT INTO "Categories" (category_id, name)
        VALUES 
          (1, 'Stationery'),
          (2, 'Books'),
          (3, 'Clothing'),
          (4, 'Electronics'),
          (5, 'Accessories')
      `;
      console.log('✅ Categories created');
    }

    // 3. Create test products
    const products = [
      {
        seller_id: seller1.user_id,
        category_id: 4,
        description: 'Dell Laptop Core i5, 8GB RAM, 256GB SSD',
        price: 8500000,
        stock: 5,
        status: 'active'
      },
      {
        seller_id: seller1.user_id,
        category_id: 4,
        description: 'HP Laptop Core i7, 16GB RAM, 512GB SSD',
        price: 15000000,
        stock: 3,
        status: 'active'
      },
      {
        seller_id: seller1.user_id,
        category_id: 2,
        description: 'Giáo trình Toán Cao Cấp - Đại Học',
        price: 150000,
        stock: 20,
        status: 'active'
      },
      {
        seller_id: seller1.user_id,
        category_id: 2,
        description: 'Sách tiếng Anh chuyên ngành IT',
        price: 200000,
        stock: 15,
        status: 'active'
      },
      {
        seller_id: seller1.user_id,
        category_id: 1,
        description: 'Bút bi xanh - Hộp 10 cây',
        price: 25000,
        stock: 100,
        status: 'active'
      }
    ];

    for (const product of products) {
      await sql`
        INSERT INTO "Product" (seller_id, category_id, description, price, stock, status, create_at, updated_at)
        VALUES (${product.seller_id}, ${product.category_id}, ${product.description}, 
                ${product.price}, ${product.stock}, ${product.status}, NOW(), NOW())
      `;
    }

    console.log('✅ Products created');
    console.log('🎉 Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();