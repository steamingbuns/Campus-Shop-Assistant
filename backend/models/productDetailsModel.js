import sql from '../db/index.js';

// Helper to get category ID by name
const getCategoryId = async (categoryName) => {
  if (!categoryName) return null;
  
  const category = await sql`
    SELECT category_id FROM public."Categories" WHERE name = ${categoryName}
  `;
  if (category.length > 0) {
    return category[0].category_id;
  }
  // If not found, create it
  const newCategory = await sql`
    INSERT INTO public."Categories" (name) VALUES (${categoryName}) RETURNING category_id
  `;
  return newCategory[0].category_id;
};

export const getProductById = async (productId) => {
  // Note: Assuming 'name' column exists in Product table. 
  // If not, please add it: ALTER TABLE public."Product" ADD COLUMN name character varying(255);
  const product = await sql`
    SELECT 
      p.product_id as id,
      p.name, 
      p.sku,
      p.price,
      p.description,
      p.stock,
      p.ratings as rating,
      c.name as category,
      u.name as seller_name,
      u.email as seller_email,
      u.phone_number as seller_phone,
      u.create_at as seller_join_date
    FROM public."Product" p
    JOIN public."User" u ON p.seller_id = u.user_id
    JOIN public."Categories" c ON p.category_id = c.category_id
    WHERE p.product_id = ${productId}
  `;

  if (product.length === 0) return null;

  const images = await sql`
    SELECT image_url 
    FROM public."Product_Image" 
    WHERE item_id = ${productId}
  `;

  const reviews = await sql`
    SELECT 
      r.review_id as id,
      r.rating,
      r.comment,
      r.create_at as date,
      u.name as user
    FROM public."Review" r
    JOIN public."User" u ON r.user_id = u.user_id
    WHERE r.item_id = ${productId}
  `;

  return {
    ...product[0],
    images: images.map(img => img.image_url),
    reviews: reviews,
    reviewCount: reviews.length
  };
};

export const getProductsBySellerId = async (sellerId) => {
  const products = await sql`
    SELECT 
      p.product_id as id,
      p.name,
      p.sku,
      COALESCE(p.stock, 0) as stock,
      COALESCE(p.low_stock_threshold, 10) as "lowStockThreshold",
      p.price,
      c.name as category,
      p.status
    FROM public."Product" p
    LEFT JOIN public."Categories" c ON p.category_id = c.category_id
    WHERE p.seller_id = ${sellerId}
    ORDER BY p.create_at DESC
  `;
  return products;
};

export const createProduct = async (productData) => {
  const {
    name,
    sku = null,
    stock = 0,
    lowStockThreshold = 10,
    price = 0,
    description = '',
    category,
    sellerId,
    image = null
  } = productData;

  if (!name || !sellerId) {
    throw new Error('Missing required fields: name and sellerId');
  }

  const categoryId = await getCategoryId(category);

  // Default category if not provided or failed
  const finalCategoryId = categoryId || 1; 

  const newProduct = await sql`
    INSERT INTO public."Product" (
      name, sku, stock, low_stock_threshold, price, description, category_id, seller_id, status
    ) VALUES (
      ${name}, ${sku}, ${stock}, ${lowStockThreshold}, ${price}, ${description}, ${finalCategoryId}, ${sellerId}, 'active'
    )
    RETURNING product_id as id, name, sku, stock, low_stock_threshold as "lowStockThreshold", price, status
  `;
  
  // If image URL provided, insert into Product_Image table
  if (image && newProduct[0]?.id) {
    await sql`
      INSERT INTO public."Product_Image" (item_id, image_url)
      VALUES (${newProduct[0].id}, ${image})
    `;
  }
  
  return { ...newProduct[0], category, image };
};

export const updateProduct = async (productId, updates) => {
  const { stock } = updates;
  
  if (stock !== undefined) {
    const updated = await sql`
      UPDATE public."Product"
      SET stock = ${stock}, updated_at = NOW()
      WHERE product_id = ${productId}
      RETURNING product_id as id, stock
    `;
    return updated[0];
  }
  return null;
};

export const deleteProduct = async (productId) => {
  const result = await sql`DELETE FROM public."Product" WHERE product_id = ${productId}`;
  return result.count > 0; // Returns true if a row was deleted, false otherwise
};
