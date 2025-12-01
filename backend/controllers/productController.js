import * as productModel from '../models/productModel.js';
import { DEFAULT_SORT_KEY } from '../models/productModel.js';
const STATUS_OPTIONS = new Set(['active', 'inactive', 'draft', 'archived']);

function parsePagination(query) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawSize = Number.parseInt(query.pageSize, 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isInteger(rawSize) && rawSize > 0 ? Math.min(rawSize, 100) : 20;
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function parseInteger(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseDecimal(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeStatus(value) {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  return STATUS_OPTIONS.has(normalized) ? normalized : null;
}

function isStaff(user) {
  return user?.role === 'staff' || user?.role === 'admin';
}

function mapProductRow(row) {
  if (!row) return null;
  const price = row.price !== null && row.price !== undefined ? Number(row.price) : null;
  const stock = row.stock !== null && row.stock !== undefined ? Number(row.stock) : null;
  const ratings = row.ratings !== null && row.ratings !== undefined ? Number(row.ratings) : null;
  const ratingAverage = row.rating_average !== null && row.rating_average !== undefined
    ? Number(row.rating_average)
    : null;
  const ratingCount = row.rating_count !== null && row.rating_count !== undefined
    ? Number(row.rating_count)
    : 0;

  return {
    id: row.id,
    sellerId: row.seller_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    name: row.name ?? row.description ?? '',
    description: row.description ?? '',
    price,
    stock,
    ratings,
    ratingAverage,
    ratingCount,
    status: row.status,
    image: row.image ?? null,
    createdAt: row.create_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

async function requireOwnership(productId, req, res) {
  const product = await productModel.getProductOwnership(productId);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }

  if (req.user?.role === 'seller' && product.seller_id !== req.user.userId) {
    res.status(403).json({ error: 'You can only manage your own products' });
    return null;
  }

  return product;
}

export async function listCategories(req, res) {
  try {
    const categories = await productModel.getCategoriesWithCounts();

    res.json({
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        parentCategoryId: category.parent_category_id,
        productCount: Number(category.product_count ?? 0),
      })),
    });
  } catch (error) {
    console.error('listCategories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function listProducts(req, res) {
  try {
    const { page, pageSize, offset } = parsePagination(req.query);
    const searchTerm = (req.query.q ?? '').trim()
      || (typeof req.query.search === 'string' ? req.query.search.trim() : '');
    const categoryId = parseInteger(req.query.categoryId);
    const sellerId = parseInteger(req.query.sellerId);
    const minPrice = parseDecimal(req.query.minPrice);
    const maxPrice = parseDecimal(req.query.maxPrice);

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
    }

    let includeAllStatuses = false;
    let statusFilter = null;
    if (req.query.status) {
      if (req.query.status === 'all' || req.query.status === 'any') {
        includeAllStatuses = true;
      } else {
        statusFilter = normalizeStatus(req.query.status);
        if (!statusFilter) {
          return res.status(400).json({ error: 'Invalid status filter' });
        }
      }
    }

    const sortParam = typeof req.query.sort === 'string' ? req.query.sort : DEFAULT_SORT_KEY;
    const sortKey = productModel.normalizeSortKey(sortParam);
    const orderBy = productModel.resolveSort(sortKey);

    const filters = {
      searchTerm,
      categoryId,
      sellerId,
      minPrice,
      maxPrice,
      includeAllStatuses,
      statusFilter,
    };

    const totalItems = await productModel.countProducts(filters);

    const products = await productModel.findProducts({
      filters,
      orderBy,
      limit: pageSize,
      offset,
    });

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;

    res.json({
      page,
      pageSize,
      totalItems,
      totalPages,
      items: products.map(mapProductRow),
      sort: sortKey,
    });
  } catch (error) {
    console.error('listProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProductById(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const row = await productModel.findProductById(productId);

    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = mapProductRow(row);
    product.seller = {
      id: row.seller_id,
      name: row.seller_name ?? null,
      email: row.seller_email ?? null,
      phoneNumber: row.seller_phone ?? null,
    };

    const images = await productModel.findProductImages(productId);

    product.images = images.map((image) => ({
      id: image.image_id,
      url: image.image_url,
    }));

    product.rating = {
      average: product.ratingAverage ?? 0,
      count: product.ratingCount ?? 0,
    };

    res.json(product);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function getProductImages(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const exists = await productModel.productExists(productId);

    if (!exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = await productModel.findProductImages(productId);

    res.json({
      images: images.map((image) => ({
        id: image.image_id,
        url: image.image_url,
      })),
    });
  } catch (error) {
    console.error('getProductImages error:', error);
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
}

export async function getProductReviews(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const exists = await productModel.productExists(productId);

    if (!exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = await productModel.findProductReviews(productId);

    res.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        itemId: review.item_id,
        userId: review.user_id,
        userName: review.user_name ?? null,
        orderId: review.order_id,
        rating: review.rating !== null ? Number(review.rating) : null,
        comment: review.comment,
        createdAt: review.create_at,
      })),
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function createProduct(req, res) {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const categoryId = parseInteger(req.body.categoryId ?? req.body.category_id);
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const priceValue = parseDecimal(req.body.price);
    const stockValue = parseInteger(req.body.stock);
    const rawStatus = req.body.status;
    const statusValue = rawStatus ? normalizeStatus(rawStatus) : 'active';

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    await productModel.ensureDefaultCategories();
    const categoryExists = await productModel.categoryExists(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category does not exist' });
    }

    if (!name && !description) {
      return res.status(400).json({ error: 'name or description is required' });
    }

    if (priceValue === null || priceValue < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }

    if (stockValue !== null && stockValue < 0) {
      return res.status(400).json({ error: 'stock must be a non-negative integer' });
    }

    if (!statusValue) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const descriptionToStore = description || name;
    const stockToStore = stockValue ?? 0;

    const imagesInput = req.body.images ?? req.body.imageUrls ?? [];
    const sanitizedImages = Array.isArray(imagesInput)
      ? imagesInput
          .map((value) => (typeof value === 'string' ? value.trim() : ''))
          .filter(Boolean)
      : [];

    const productId = await productModel.createProduct({
      sellerId,
      categoryId,
      description: descriptionToStore,
      price: priceValue,
      stock: stockToStore,
      status: statusValue,
      images: sanitizedImages,
    });

    res.status(201).json({ message: 'Product created', id: productId });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const product = await requireOwnership(productId, req, res);
    if (!product) return;

    const updates = {};
    const payload = req.body ?? {};

    if (payload.categoryId !== undefined || payload.category_id !== undefined) {
      const categoryId = parseInteger(payload.categoryId ?? payload.category_id);
      if (categoryId === null) {
        return res.status(400).json({ error: 'Invalid categoryId' });
      }
      await productModel.ensureDefaultCategories();
      const exists = await productModel.categoryExists(categoryId);
      if (!exists) {
        return res.status(400).json({ error: 'Category does not exist' });
      }
      updates.category_id = categoryId;
    }

    if (payload.name !== undefined || payload.description !== undefined) {
      const description = ((payload.description ?? payload.name) ?? '').toString().trim();
      if (!description) {
        return res.status(400).json({ error: 'Product description cannot be empty' });
      }
      updates.description = description;
    }

    if (payload.price !== undefined) {
      const priceValue = parseDecimal(payload.price);
      if (priceValue === null || priceValue < 0) {
        return res.status(400).json({ error: 'Invalid price value' });
      }
      updates.price = priceValue;
    }

    if (payload.stock !== undefined) {
      const stockValue = parseInteger(payload.stock);
      if (stockValue === null || stockValue < 0) {
        return res.status(400).json({ error: 'Invalid stock value' });
      }
      updates.stock = stockValue;
    }

    if (payload.status !== undefined) {
      const statusValue = normalizeStatus(payload.status);
      if (!statusValue) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      updates.status = statusValue;
    }

    if (payload.ratings !== undefined) {
      if (!isStaff(req.user)) {
        return res.status(403).json({ error: 'Only staff can update ratings directly' });
      }
      const ratingsValue = parseInteger(payload.ratings);
      if (ratingsValue === null || ratingsValue < 1 || ratingsValue > 5) {
        return res.status(400).json({ error: 'ratings must be between 1 and 5' });
      }
      updates.ratings = ratingsValue;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updated = await productModel.updateProduct(productId, updates);

    res.json({ message: 'Product updated', id: updated.id });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function updateProductStock(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const product = await requireOwnership(productId, req, res);
    if (!product) return;

    const stockValue = parseInteger(req.body.stock);
    if (stockValue === null || stockValue < 0) {
      return res.status(400).json({ error: 'stock must be a non-negative integer' });
    }

    const updated = await productModel.updateProductStock(productId, stockValue);

    res.json({
      message: 'Stock updated',
      id: updated.id,
      stock: Number(updated.stock),
    });
  } catch (error) {
    console.error('updateProductStock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
}

export async function decreaseProductStock(req, res) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each item must have a valid productId and a positive quantity' });
      }
    }

    // Check if products exist and have enough stock
    for (const item of items) {
      const product = await productModel.findProductById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
      }
    }

    await productModel.decreaseProductStock(items);

    res.json({ message: 'Product stocks decreased successfully' });
  } catch (error) {
    console.error('decreaseProductStock error:', error);
    res.status(500).json({ error: 'Failed to decrease product stock' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const deleted = await productModel.deleteProduct(productId);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted', id: deleted.id });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

export async function addProductImage(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const product = await requireOwnership(productId, req, res);
    if (!product) return;

    const imageUrl = (req.body.image_url ?? req.body.imageUrl ?? '').trim();
    if (!imageUrl) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    const row = await productModel.createProductImage(productId, imageUrl);

    res.status(201).json({
      message: 'Image added',
      image: {
        id: row.id,
        url: row.image_url,
      },
    });
  } catch (error) {
    console.error('addProductImage error:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
}

export async function deleteProductImage(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    const imageId = parseInteger(req.params.imageId);
    if (productId === null || imageId === null) {
      return res.status(400).json({ error: 'Invalid product or image id' });
    }

    const image = await productModel.getProductImageWithSeller(productId, imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (req.user?.role === 'seller' && image.seller_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only manage images for your own products' });
    }

    await productModel.deleteProductImage(productId, imageId);

    res.json({ message: 'Image deleted', imageId });
  } catch (error) {
    console.error('deleteProductImage error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
}

export async function addProductReview(req, res) {
  try {
    const productId = parseInteger(req.params.id);
    if (productId === null) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const ratingValue = parseInteger(req.body.rating);
    const commentValue = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

    if (ratingValue === null || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    const exists = await productModel.productExists(productId);
    if (!exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find a completed order for this product by the user
    const order = await productModel.findCompletedOrderForProductByUser({
      userId: req.user.userId,
      productId,
    });

    if (!order) {
      return res.status(403).json({ error: 'You can only review products you have purchased and received.' });
    }
    const orderId = order.order_id;

    const alreadyReviewed = await productModel.hasReviewForOrder({
      productId,
      orderId,
      userId: req.user.userId,
    });

    if (alreadyReviewed) {
      return res.status(409).json({ error: 'You have already reviewed this product for this order.' });
    }

    const review = await productModel.createProductReview({
      productId,
      userId: req.user.userId,
      orderId,
      rating: ratingValue,
      comment: commentValue,
    });

    res.status(201).json({
      message: 'Review added',
      review: {
        id: review.id,
        itemId: productId,
        userId: req.user.userId,
        orderId,
        rating: Number(review.rating),
        comment: review.comment,
        createdAt: review.create_at,
      },
    });
  } catch (error) {
    console.error('addProductReview error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
}

export async function updateProductReview(req, res) {
  try {
    const reviewId = parseInteger(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    const review = await productModel.findReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!isStaff(req.user) && review.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    const updates = {};

    if (req.body.rating !== undefined) {
      const ratingValue = parseInteger(req.body.rating);
      if (ratingValue === null || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
      }
      updates.rating = ratingValue;
    }

    if (req.body.comment !== undefined) {
      const commentValue = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
      updates.comment = commentValue || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await productModel.updateReview(reviewId, updates);

    res.json({
      message: 'Review updated',
      review: {
        id: updated.id,
        itemId: updated.item_id,
        userId: updated.user_id,
        orderId: updated.order_id,
        rating: updated.rating !== null ? Number(updated.rating) : null,
        comment: updated.comment,
        createdAt: updated.create_at,
      },
    });
  } catch (error) {
    console.error('updateProductReview error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
}

export async function deleteProductReview(req, res) {
  try {
    const reviewId = parseInteger(req.params.reviewId);
    if (reviewId === null) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    const deleted = await productModel.deleteReview(reviewId);

    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted', reviewId: deleted.id });
  } catch (error) {
    console.error('deleteProductReview error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
}
