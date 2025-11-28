import api from './api';

const adminService = {
  // Users
  getUsers: (token) => api.get('/admin/users', { token }),
  warnUser: (id, message, token) => api.post(`/admin/users/${id}/warn`, { message }, { token }),
  suspendUser: (id, reason, token) => api.post(`/admin/users/${id}/suspend`, { reason }, { token }),
  unsuspendUser: (id, token) => api.post(`/admin/users/${id}/unsuspend`, {}, { token }),

  // Listings
  getListings: (params, token) => api.get('/admin/listings', { params, token }),
  approveListing: (id, token) => api.post(`/admin/listings/${id}/approve`, {}, { token }),
  editListing: (id, data, token) => api.put(`/admin/listings/${id}`, data, { token }),
  deleteListing: (id, reason, token) => api.delete(`/admin/listings/${id}`, { data: { reason }, token }),

  // Transactions
  getTransactions: (token) => api.get('/admin/transactions', { token }),
};

export default adminService;
