import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// POST /api/report/create               -> Create a new report (auth required)
router.post('/', authenticate, reportController.createReport);

// GET /api/report/status/:status -> Get reports by status (staff/admin only)
router.get('/status/:status', authenticate, authorize(['staff', 'admin']), reportController.getReportsByStatus);

// PUT /api/report/:report_id     -> Update report status (staff/admin only)
router.put('/:report_id', authenticate, authorize(['staff', 'admin']), reportController.updateReportStatus);

// GET /api/report/search         -> Search reports by query (staff/admin only)
router.post('/search', authenticate, authorize(['staff', 'admin']), reportController.filterReportsBySearchQuery);

// GET /api/report                -> Get all reports (staff/admin only)
router.get('/', authenticate, authorize(['staff', 'admin']), reportController.getAllReports);

// GET /api/report/:report_id     -> Get report by ID (staff/admin only)
router.get('/:report_id', authenticate, authorize(['staff', 'admin']), reportController.getReportById);

// DELETE /api/report/:report_id  -> Delete a report by ID (admin only)
router.delete('/:report_id', authenticate, authorize(['admin']), reportController.deleteReportById);

export default router;