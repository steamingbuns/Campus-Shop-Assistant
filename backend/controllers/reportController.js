import * as reportModel from '../models/reportModel.js';
import { findProductById } from '../models/productModel.js';
import { findUserById } from '../models/userModel.js';

export const createReport = async (req, res) => {
    try {
        const { reporter_id, item_id, details } = req.body;
        if (!item_id || !reporter_id) {
            return res.status(400).json({ error: 'reporter_id and item_id are required' });
        }

        const reporter = await findUserById(reporter_id);
        const item = await findProductById(item_id);
        if (!item) {
            return res.status(404).json({ error: 'Reported item not found' });
        }
        if (!reporter) {
            return res.status(404).json({ error: 'Reporter user not found' });
        }

        const newReport = await reportModel.createReport(reporter_id, item_id, details);

        res.json({ message: 'Report created successfully', newReport: newReport });
    }
    catch (err) {
        console.log("createReport error:", err);
        res.status(500).json({ error: 'Failed to create report' });
    }
};

export const getReportsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const reports = await reportModel.getReportsByStatus(status);
        res.json(reports);
    }
    catch (err) {
        console.log("getReportsByStatus error:", err);
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
};

export const updateReportStatus = async (req, res) => {
    try {
        const { report_id } = req.params;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ error: 'newStatus is required' });
        }

        if (!['open', 'in-review', 'resolved'].includes(newStatus)) {
            return res.status(400).json({ error: 'Invalid status value' });
        };

        const updatedReport = await reportModel.updateReportStatus(report_id, newStatus);
        res.json({ message: 'Report status updated successfully', report_id: report_id, newStatus: newStatus });
    }
    catch (err) {
        console.log("updateReportStatus error:", err);
        res.status(500).json({ error: 'Failed to update report status' });
    }
};

export const filterReportsBySearchQuery = async (req, res) => {
    try {
        const searchQuery = req.body.searchQuery;
        const reports = await reportModel.filterReportsBySearchQuery(searchQuery);
        res.json(reports);
    }
    catch (err) {
        console.log("filterReportsBySearchQuery error:", err);
        res.status(500).json({ error: 'Failed to filter reports' });
    }
};

export const getAllReports = async (req, res) => {
    try {
        const reports = await reportModel.getAllReports();
        res.json(reports);
    }
    catch (err) {
        console.log("getAllReports error:", err);
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
};

export const deleteReportById = async (req, res) => {
    try {
        const { report_id } = req.params;
        const report = await reportModel.getReportById(report_id);
        console.log(report);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        await reportModel.deleteReportById(report_id);
        res.json({ message: 'Report deleted successfully', report_id: report_id });
    }
    catch (err) {
        console.log("deleteReportById error:", err);
        res.status(500).json({ error: 'Failed to delete report' });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { report_id } = req.params;
        const report = await reportModel.getReportById(report_id);
        console.log(report);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(report);
    }
    catch (err) {
        console.log("getReportById error:", err);
        res.status(500).json({ error: 'Failed to retrieve report' });
    }
};
