import api from './api';

const productDetailsService = {
  // Get a single product by ID (public)
  getProductById: (id) => api.get(`/product-details/${id}`),
  
  // Get seller's inventory (protected)
  getSellerInventory: (options) => api.get('/product-details/seller/inventory', options),
  
  // Create a new product (protected)
  createProduct: (productData, options) => api.post('/product-details', productData, options),
  
  // Update a product (protected)
  updateProduct: (id, productData, options) => api.patch(`/product-details/${id}`, productData, options),
  
  // Delete a product (protected)
  deleteProduct: (id, options) => api.delete(`/product-details/${id}`, options),

  // Categories (protected or public depending on backend)
  getCategories: (options) => api.get('/product/categories', options),
};

export default productDetailsService;
