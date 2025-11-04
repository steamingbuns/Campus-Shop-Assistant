import api from './api.js';

const userService = {
  // Get current user profile (requires authentication)
  async getProfile(token) {
    return api.get('/users/me', token);
  },

  // Update current user profile (requires authentication)
  async updateProfile(userData, token) {
    return api.put('/users/me', userData, token);
  },

  // Change password (requires authentication)
  async changePassword(passwordData, token) {
    return api.post('/users/change-password', passwordData, token);
  },

  // Get all users (requires staff role)
  async getAllUsers(token) {
    return api.get('/users', token);
  },

  // Refresh token
  async refreshToken() {
    return api.post('/users/refresh');
  },

  // Test token validity
  async testToken(token) {
    return api.get('/users/test-token', token);
  },

  // Check if user can review a product
  async checkReviewEligibility(productId, token) {
    return api.get(`/users/check-review-eligibility/${productId}`, token);
  },
};

export default userService;