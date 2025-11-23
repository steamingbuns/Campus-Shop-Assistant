import sql from '../db/index.js';

// Actual functions

export const createReport = async (reporter_id, item_id, details) => {
    try {
        const result = await sql
            `INSERT INTO "Report" (reporter_id, item_id, details, status)
            VALUES (${reporter_id}, ${item_id}, ${details}, 'open')
            RETURNING *`;
        return result[0];
    }
    catch (err) {
        console.log("Error in createReport:", err);
        throw err;
    }
};

export const getReportsByStatus = async (status) => {
    try {
        const results =  await sql
            `SELECT * FROM "Report" WHERE status=${status}`
            ;

        return results;
    }
    catch (err) {
        console.log("Error in getReportsByStatus:", err);
        throw err;
    }
};

export const updateReportStatus = async (report_id, newStatus) => {
    try {
        const result = await sql
            `UPDATE "Report"
         SET status=${newStatus}
         WHERE report_id=${report_id}
         RETURNING *`;
        return result[0];
    }
    catch (err) {
        console.log("Eror in updateReportStatus:", err);
        throw err;
    }
};

// Seach reports by report ID or details content
export const filterReportsBySearchQuery = async (searchQuery) => {
    try {
        const query = `%${searchQuery.trim().toLowerCase()}%`;
        const results = await sql
            `SELECT * FROM "Report"
         WHERE LOWER(details) LIKE ${query}
            OR CAST(report_id AS TEXT) LIKE ${query}`;
        return results;
    }
    catch (err) {
        console.log("Error in filterReportsBySearchQuery:", err);
        throw err;
    }
};

export const getAllReports = async () => {
    try {
        const results = await sql
            `SELECT * FROM "Report"`;
        return results;
    }
    catch (err) {
        console.log("Error in getAllReports:", err);
        throw err;
    }
};

export const deleteReportById = async (report_id) => {
    try {
        await sql
            `DELETE FROM "Report"
         WHERE report_id=${report_id}`;
    }
    catch (err) {
        console.log("Error in deleteReportById:", err);
        throw err;
    }
};

export const getReportById = async (report_id) => {
    try {
        const result = await sql
        `SELECT * FROM "Report"
         WHERE report_id=${report_id}`;
        return result[0];
    }
    catch (err) {
        console.log("Error in getReportById:", err);
        throw err;
    }
}