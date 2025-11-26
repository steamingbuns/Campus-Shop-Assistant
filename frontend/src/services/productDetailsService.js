import api from './api';

const productDetailsService = {
  // Get a single product by ID (public)
  getProductById: (id) => api.get(`/product-details/${id}`),
  
  // Get seller's inventory (protected)
  getSellerInventory: () => api.get('/product-details/seller/inventory'),
  
  // Create a new product (protected)
  createProduct: (productData) => api.post('/product-details', productData),
  
  // Update a product (protected)
  updateProduct: (id, productData) => api.patch(`/product-details/${id}`, productData),
  
  // Delete a product (protected)
  deleteProduct: (id) => api.delete(`/product-details/${id}`),
};

export default productDetailsService;
