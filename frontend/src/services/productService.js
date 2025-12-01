import api from './api.js';

// Normalizes filter parameters for the product list endpoint.
function normalizePaginationParams(filters = {}) {
  const {
    search,
    categoryId,
    page,
    pageSize,
    minPrice,
    maxPrice,
    sort,
    sellerId,
    status,
  } = filters;

  // Create a new object to avoid modifying the original
  const params = {
    q: search,
    categoryId,
    page,
    pageSize,
    minPrice,
    maxPrice,
    sort,
    sellerId,
    status,
  };

  // Remove undefined or null values so they aren't sent as empty query params
  Object.keys(params).forEach(key => {
    if (params[key] === undefined || params[key] === null) {
      delete params[key];
    }
  });

  return params;
}

const productService = {
  // Fetch a list of products with optional filters.
  async listProducts(filters) {
    return api.get('/product', { params: normalizePaginationParams(filters) });
  },

  // Fetch all product categories.
  async getCategories() {
    return api.get('/product/categories');
  },

  // Fetch a single product by its ID.
  async getProduct(productId) {
    return api.get(`/product/${productId}`);
  },

  // Fetch all images for a specific product.
  async getProductImages(productId) {
    return api.get(`/product/${productId}/images`);
  },

  // Fetch all reviews for a specific product.
  async getProductReviews(productId) {
    return api.get(`/product/${productId}/reviews`);
  },

  // Create a new product (requires authentication).
  async createProduct(productData, token) {
    return api.post('/product', { data: productData, token });
  },

  // Update an existing product (requires authentication).
  async updateProduct(productId, productData, token) {
    return api.put(`/product/${productId}`, { data: productData, token });
  },

  // Update a product's stock (requires authentication).
  async updateProductStock(productId, stockData, token) {
    return api.patch(`/product/${productId}/stock`, { data: stockData, token });
  },

  // Decrease stock for multiple products (requires authentication).
  async decreaseProductStock(items, token) {
    return api.patch('/product/stock/decrease', { data: { items }, token });
  },

  // Delete a product (requires authentication).
  async deleteProduct(productId, token) {
    return api.delete(`/product/${productId}`, { token });
  },

  // Add an image to a product (requires authentication).
  async addProductImage(productId, imageData, token) {
    return api.post(`/product/${productId}/images`, { data: imageData, token });
  },

  // Delete a product image (requires authentication).
  async deleteProductImage(productId, imageId, token) {
    return api.delete(`/product/${productId}/images/${imageId}`, { token });
  },

  // Add a review to a product (requires authentication).
  async addReview(productId, reviewData, token) {
    return api.post(`/product/${productId}/reviews`, { data: reviewData, token });
  },

  // Update a review (requires authentication).
  async updateReview(productId, reviewId, reviewData, token) {
    return api.put(`/product/${productId}/reviews/${reviewId}`, { data: reviewData, token });
  },

  // Delete a review (requires authentication).
  async deleteReview(productId, reviewId, token) {
    return api.delete(`/product/${productId}/reviews/${reviewId}`, { token });
  },
};

export default productService;