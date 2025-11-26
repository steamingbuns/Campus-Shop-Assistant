import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import reportService from '../../services/reportService.js';

const STATUS_ORDER = {
    'open': 1,
    'in-review': 2,
    'resolved': 3,
};

const INVALID_STATUS = 99;

const ReportCard = ({ report, renderActionButton, onDelete }) => {
    let statusText;
    switch (report.status) {
        case "open":
            statusText = "Open";
            break;
        case "in-review":
            statusText = "In Review";
            break;
        case "resolved":
            statusText = "Resolved";
            break;
        default:
            statusText = "Invalid State";
            break;
    }

    const handleDeleteClick = () => {
        // Always be skeptical and double-check with the user (confirmation box)
        if (window.confirm(`Are you absolutely sure you want to permanently delete Report ID ${report.report_id}? This action cannot be undone.`)) {
            // Call the handler passed down from the parent
            onDelete(report.report_id);
        }
    };

    return (
        <div className={`report-card`} key={report.report_id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#ffffff'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    <strong>Report ID:</strong> {report.report_id}
                </h3>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: report.status === 'open' ? '#fee2e2' :
                        report.status === 'in-review' ? '#fef3c7' : '#dcfce7',
                    color: report.status === 'open' ? '#991b1b' :
                        report.status === 'in-review' ? '#92400e' : '#166534'
                }}>
                    {statusText}
                </span>
            </div>
            <div style={{ marginBottom: '12px', color: '#4b5563' }}>
                <p style={{ margin: '4px 0' }}><strong>Reported by:</strong> {report.reporter_id}</p>
                <div>
                    <p style={{ margin: '4px 0' }}><strong>Product ID:</strong> {report.item_id}</p>
                    <p style={{ margin: '4px 0' }}><strong>Details:</strong> {report.details}</p>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {renderActionButton(report)}
                <button
                    onClick={handleDeleteClick}
                >
                    Delete 🗑️
                </button>
            </div>
        </div>
    );
};

export default function ReportsPanel() {
    const { isLoggedIn, user, token } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [reportsList, setReportsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    if (!isLoggedIn || user.role !== 'admin') {
        return <div>You do not have permission to view this page.</div>;
    }

    const fetchReports = useCallback(async (query = '') => {
        setIsLoading(true);
        setError(null);

        try {
            let fetchedReports;
            if (query) {
                // Priority 1: Search query takes precedence and fetches across all reports
                fetchedReports = await reportService.filterReportsBySearchQuery({ searchQuery: query }, token);

                // Defaults to 'all' if using query to search
                setFilterStatus('all');
            }
            else if (filterStatus !== 'all') {
                // Priority 2: Filter by specific status
                fetchedReports = await reportService.getReportsByStatus(filterStatus, token);
            }
            else {
                // Default: Fetch all reports
                fetchedReports = await reportService.getAllReports(token);
            }

            const sorted = fetchedReports.sort((a, b) => {
                const statusA = STATUS_ORDER[a.status] || INVALID_STATUS;
                const statusB = STATUS_ORDER[b.status] || INVALID_STATUS;
                if (statusA !== statusB) {
                    return statusA - statusB;
                }
                return a.report_id - b.report_id;
            });

            setReportsList(sorted);
        }
        catch (err) {
            setError('Failed to fetch reports. Please try again later.');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        };
    }, [token, filterStatus]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchReports(searchQuery);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, fetchReports, filterStatus]);

    const updateReportStatus = useCallback(async (reportId, newStatus) => {
        try {
            await reportService.updateReportStatus(reportId, { newStatus: newStatus }, token);

            fetchReports(searchQuery, filterStatus);
        }
        catch (err) {
            setError('Failed to update report status. Please try again later.');
            console.error(err);
        }
    }, [token, fetchReports, searchQuery, filterStatus]);

    const handleStatusChange = useCallback((reportId, currStatus) => {
        let newStatus;
        switch (currStatus) {
            case 'open':
                newStatus = 'in-review';
                break;
            case 'in-review':
                newStatus = 'resolved';
                break;
            default:
                return;
        }
        updateReportStatus(reportId, newStatus);
    }, [updateReportStatus]);

    const renderActionButton = useCallback((report) => {
        if (report.status === 'resolved') return null;

        const buttonText = report.status === 'open' ? 'Start Review' : 'Mark as Resolved';
        const buttonColor = report.status === 'open' ? '#2563eb' : '#16a34a';

        return (
            <button
                style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: buttonColor,
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                }}
                onClick={() => handleStatusChange(report.report_id, report.status)}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
            >
                {buttonText}
            </button>
        );
    }, [handleStatusChange]);

    const statusOptions = [
        { label: 'All', value: 'all', color: '#6b7280' },
        { label: 'Open', value: 'open', color: '#991b1b' },
        { label: 'In Review', value: 'in-review', color: '#92400e' },
        { label: 'Resolved', value: 'resolved', color: '#166534' },
    ];

    const handleFilterClick = (status) => {
        setSearchQuery(''); // Clear search query when changing filters
        setFilterStatus(status);
    }

    const handleDeleteReport = useCallback(async (reportId) => {
        setError(null);
        try {
            await reportService.deleteReportById(reportId, token);
            fetchReports(searchQuery);
        } catch (err) {
            setError(`Failed to delete Report ID ${reportId}.`);
            console.error(err);
        }
    }, [token, fetchReports, searchQuery]);

    return (
        <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', marginTop: 0 }}>
                View Reports
            </h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {statusOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => handleFilterClick(option.value)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: `2px solid ${filterStatus === option.value ? option.color : '#d1d5db'}`,
                            backgroundColor: filterStatus === option.value ? option.color : '#ffffff',
                            color: filterStatus === option.value ? '#ffffff' : option.color,
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                        }}
                        onMouseOver={(e) => {
                            if (filterStatus !== option.value) {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (filterStatus !== option.value) {
                                e.target.style.backgroundColor = '#ffffff';
                            }
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type='text'
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                    placeholder='Search by report ID or details...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
            </div>
            {isLoading && <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Loading reports...</p>}
            {error && <p style={{ textAlign: 'center', color: '#dc2626', padding: '20px' }}>Error: {error}</p>}

            {!isLoading && !error && (
                <div>
                    {reportsList.length > 0 ? (
                        reportsList.map(report => (
                            <ReportCard
                                key={report.report_id}
                                report={report}
                                renderActionButton={renderActionButton}
                                onDelete={handleDeleteReport}
                            />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                            No reports found
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
