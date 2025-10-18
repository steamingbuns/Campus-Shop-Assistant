import { useCallback, useMemo, useState } from 'react';
import './ViewReports.css'

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
        <div className={`report report-type-${report.type}`} key={report.id}>
            <div className='report-header'>
                <h3 className='report-id'><strong>Report ID:</strong> {report.id}</h3>
                <span className={`status-${report.status}`}>
                    <h3><strong>Status: </strong>{statusText}</h3>
                </span>
            </div>
            <div className='report-details'>
                <p><strong>Type:</strong> {report.type}</p>
                <p><strong>Reported by:</strong> {report.reporterUser}</p>

                {report.type === 'product' ? (
                    <div className='product-details'>
                        <p><strong>Product ID:</strong> {report.productID}</p>
                        <p><strong>Details:</strong> {report.details}</p>
                    </div>
                ) : (
                    <div className='message-details'>
                        <p><strong>Message:</strong> {report.message}</p>
                        <p><strong>Sent by:</strong> {report.fromUser}</p>
                        <p><strong>Details:</strong> {report.details}</p>
                    </div>
                )}
            </div>
            <div className='report-actions'>
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
        details: ".lasndvl;ajndwvpoq3n4vpaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
]

function ViewReports() {
    const [searchQuery, setSearchQuery] = useState('');

    const [reportsList, setReportsList] = useState(MockReports);

    const updateReportStatus = useCallback((reportId, newStatus) => {
        setReportsList(currentReports =>
            currentReports.map(report =>
                report.id === reportId ? { ...report, status: newStatus } : report
            )
        );
    }, [])

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
                return; // Do nothing if already 'resolved'
        }
        updateReportStatus(reportId, newStatus);
    }, [updateReportStatus]);

    const sortedReports = useMemo(() => {
        return [...reportsList].sort((a, b) => {
            // Primary: sort by status
            const statusA = STATUS_ORDER[a.status] || INVALID_STATUS;
            const statusB = STATUS_ORDER[b.status] || INVALID_STATUS;

            if (statusA !== statusB) {
                return statusA - statusB;
            }

            // Secondary: sort by ID
            return a.id - b.id;
        });
    }, reportsList)

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
        })
    })

    const renderActionButton = useCallback((report) => {
        if (report.status === 'resolved') return null;

        const buttonText = report.status === 'open' ? 'Start Review' : 'Mark as Resolved';
        const buttonClass = report.status === 'open' ? 'start-review-btn' : 'mark-resolved-btn';

        return (
            <button
                className={buttonClass}
                onClick={() => handleStatusChange(report.id, report.status)}
            >
                {buttonText}
            </button>
        );
    }, [handleStatusChange]);

    return (
        <div className='view-reports-page'>
            <h1>Help Desk Reports</h1>
            <div className='container'>
                <div className='search-reports'>
                    <input type='text'
                        className='search-input'
                        placeholder='Search by ID, details, or reporter name...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className='reports-list'>
                    {
                        filteredReports.map(report => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                handleStatusChange={handleStatusChange}
                                renderActionButton={renderActionButton}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}

export default ViewReports