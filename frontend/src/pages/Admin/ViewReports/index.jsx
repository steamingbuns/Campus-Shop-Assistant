import { useCallback, useMemo, useState } from 'react';
import './ViewReports.css'

function ViewReports() {
    const [searchQuery, setSearchQuery] = useState('');

    const [reportsList, setReportsList] = useState(() => [
        {
            id: 1,
            reporterUserID: 2,
            type: 'product',
            productID: 2,
            details: '.lasndvl;ajndwvpoq3n4vpaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            status: 'resolved'
        },
        {
            id: 2,
            reporterUserID: 1,
            type: 'message',
            message: 'Urgent assistance needed',
            fromUserID: 3,
            details: 'Server downtime',
            status: 'in_review'
        },
        {
            id: 3,
            reporterUserID: 2,
            type: 'product',
            productID: 5,
            details: 'Torn pages',
            status: 'resolved'
        },
        {
            id: 4,
            reporterUserID: 1,
            type: 'message',
            message: 'Follow-up query',
            fromUserID: 7,
            details: 'Pricing question',
            status: 'open'
        },
        {
            id: 5,
            reporterUserID: 4,
            type: 'product',
            productID: 6,
            details: 'Scam only 16GB',
            status: 'open'
        }
    ])

    const updateReportStatus = useCallback((reportId, newStatus) => {
        setReportsList(currentReports => 
            currentReports.map(report => 
                report.id === reportId ? {...report, status: newStatus} : report
            )
        );
    }, [])

    const handleStatusChange = (reportId, currStatus) => {
        let newStatus;
        switch (currStatus) {
            case 'open':
                newStatus = 'in-review';
                break;
            case 'in-review':
                newStatus = 'resolved';
                break;
            case 'resolved':
                newStatus = 'in-review';
                break;
            default:
                return;
        }
        updateReportStatus(reportId, newStatus);
    }

    const filteredReports = useMemo(() => {
        if (!searchQuery) {
            return reportsList;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();

        return reportsList.filter(report => {
            const idMatch = report.id.toString().includes(lowerCaseQuery);
            const detailsMatch = report.details.toLowerCase().includes(lowerCaseQuery);
            const messageMatch = report.message && report.message.toLowerCase().includes(lowerCaseQuery);

            return idMatch || detailsMatch || messageMatch;
        })
    })

    const renderActionButton = (report) => {
        switch (report.status) {
            case 'open':
                return (
                    <button className='resolve-btn'
                    onClick={() =>  handleStatusChange(report.id, 'open')}
                    >
                        Resolve
                    </button>
                )
            case 'in-review':
                return (
                    <button className='mark-resolved-btn'
                    onClick={() =>  handleStatusChange(report.id, 'in-review')}
                    >
                        Mark as Resolved
                    </button>
                )
            case 'resolved':
                return (
                    <button className='reopen-btn'
                    onClick={() =>  handleStatusChange(report.id, 'resolved')}
                    >
                        Re-open
                    </button>
                )
            default:
                return null;
        }
    }

    return (
        <div className='view-reports-page'>
            <h1>View Reports</h1>
            <div className='container'>
                <div className='search-reports'>
                    <input type='text'
                        className='search-input'
                        placeholder='Enter a name or a report ID'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className='reports-list'>
                    {
                        filteredReports.map(report => (
                            <div key={report.id} className={`report status-${report.status}`}>
                                <div className='report-header'>
                                    <h3><strong>Report ID:</strong> {report.id}</h3>
                                    <h3><strong>Status:</strong> <span className={`status-${report.status}`}>{report.status}</span></h3>
                                </div>
                                <div className='report-details'>
                                    <p><strong>Type:</strong> {report.type}</p>
                                    <p><strong>Reported by:</strong> {report.reporterUserID}</p>
                                    {
                                        report.type === 'product' ? (
                                            <div className='product-details'>
                                                <p><strong>Product ID:</strong> {report.productID}</p>
                                                <p><strong>Details:</strong> {report.details}</p>
                                            </div>
                                        ) : (
                                            <div className='message-details'>
                                                <p><strong>Message:</strong> {report.message}</p>
                                                <p><strong>Sent by:</strong> {report.fromUserID}</p>
                                                <p><strong>Details:</strong> {report.details}</p>
                                            </div>
                                        )
                                    }
                                </div>
                                <div className='report-actions'>
                                    {renderActionButton(report)}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>);
}

export default ViewReports