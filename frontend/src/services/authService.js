import api from './api.js';

const authService = {
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async logout(token) {
    return api.post('/auth/logout', null, token);
  },
};

export default authService;