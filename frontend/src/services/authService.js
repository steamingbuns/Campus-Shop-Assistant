import api from './api.js';

const authService = {
  async register(userData) {
    return api.post('/users/register', userData);
  },

  async login(credentials) {
    return api.post('/users/login', credentials);
  },

  async logout(token) {
    return api.post('/users/logout', null, token);
  },
};

export default authService;