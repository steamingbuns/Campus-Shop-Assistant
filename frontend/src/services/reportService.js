import api from './api.js';

const reportService = {
    // Create a new report (requires authentication)
    async createReport(parameters, token) {
        return api.post('/report', parameters, token);
    },

    // Get reports by status (requires staff/admin role)
    async getReportsByStatus(status, token) {
        return api.get(`/report/status/${status}`, token);
    },

    // Update report status (requires staff/admin role),
    async updateReportStatus(reportId, statusData, token) {
        console.log(statusData);
        return api.put(`/report/${reportId}`, statusData, token);
    },

    // Search reports by query (requires staff/admin role)
    async filterReportsBySearchQuery(queryParams, token) {
        return api.post('/report/search', queryParams, token);
    },

    // Get all reports (requires staff/admin role)
    async getAllReports(token) {
        return api.get('/report', token);
    },

    // Delete a report by ID (requires admin role)
    async deleteReportById(reportId, token) {
        return api.delete(`/report/${reportId}`, token);
    }, 

    // Admin: fetch sales & transaction history
    async getAdminTransactions(token) {
        return api.get('/admin/transactions', token);
    },
};

export default reportService;
