import { useCallback, useMemo, useState } from 'react';

const STATUS_ORDER = {
    'open': 1,
    'in-review': 2,
    'resolved': 3,
};

const INVALID_STATUS = 99;

const ReportCard = ({ report, handleStatusChange, renderActionButton }) => {
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
    return (
        <div className={`report-card`} key={report.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#ffffff'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    <strong>Report ID:</strong> {report.id}
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
                <p style={{ margin: '4px 0' }}><strong>Type:</strong> {report.type}</p>
                <p style={{ margin: '4px 0' }}><strong>Reported by:</strong> {report.reporterUser}</p>

                {report.type === 'product' ? (
                    <div>
                        <p style={{ margin: '4px 0' }}><strong>Product ID:</strong> {report.productID}</p>
                        <p style={{ margin: '4px 0' }}><strong>Details:</strong> {report.details}</p>
                    </div>
                ) : (
                    <div>
                        <p style={{ margin: '4px 0' }}><strong>Message:</strong> {report.message}</p>
                        <p style={{ margin: '4px 0' }}><strong>Sent by:</strong> {report.fromUser}</p>
                        <p style={{ margin: '4px 0' }}><strong>Details:</strong> {report.details}</p>
                    </div>
                )}
            </div>
            <div>
                {renderActionButton(report)}
            </div>
        </div>
    );
};

const MockReports = [
    {
        id: 1,
        type: "product",
        productID: 2,
        details: "Product description doesn't match actual item",
        status: "resolved",
        reporterUser: "Alex Chen"
    },
    {
        id: 2,
        type: "message",
        message: "Urgent assistance needed",
        details: "Server downtime",
        status: "in-review",
        reporterUser: "Kenji Sato",
        fromUser: "Sam Geller"
    },
    {
        id: 3,
        type: "product",
        productID: 5,
        details: "Torn pages",
        status: "resolved",
        reporterUser: "Kenji Sato"
    },
    {
        id: 4,
        type: "message",
        message: "Follow-up query",
        details: "Pricing question",
        status: "open",
        reporterUser: "Jules Winn",
        fromUser: "Alex Chen"
    },
    {
        id: 5,
        type: "product",
        productID: 6,
        details: "Scam only 16GB",
        status: "open",
        reporterUser: "Alex Chen"
    }
];

export default function ReportsPanel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [reportsList, setReportsList] = useState(MockReports);

    const updateReportStatus = useCallback((reportId, newStatus) => {
        setReportsList(currentReports =>
            currentReports.map(report =>
                report.id === reportId ? { ...report, status: newStatus } : report
            )
        );
    }, []);

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

    const sortedReports = useMemo(() => {
        return [...reportsList].sort((a, b) => {
            const statusA = STATUS_ORDER[a.status] || INVALID_STATUS;
            const statusB = STATUS_ORDER[b.status] || INVALID_STATUS;

            if (statusA !== statusB) {
                return statusA - statusB;
            }

            return a.id - b.id;
        });
    }, [reportsList]);

    const filteredReports = useMemo(() => {
        if (!searchQuery) {
            return sortedReports;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();

        return sortedReports.filter(report => {
            const idMatch = report.id.toString().includes(lowerCaseQuery);
            const detailsMatch = report.details.toLowerCase().includes(lowerCaseQuery);
            const messageMatch = report.message && report.message.toLowerCase().includes(lowerCaseQuery);

            return idMatch || detailsMatch || messageMatch;
        });
    }, [searchQuery, sortedReports]);

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
                onClick={() => handleStatusChange(report.id, report.status)}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
            >
                {buttonText}
            </button>
        );
    }, [handleStatusChange]);

    return (
        <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', marginTop: 0 }}>
                View Reports
            </h2>
            
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
                    placeholder='Search by ID, details, or reporter name...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
            </div>

            <div>
                {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            handleStatusChange={handleStatusChange}
                            renderActionButton={renderActionButton}
                        />
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                        No reports found
                    </p>
                )}
            </div>
        </div>
    );
}
