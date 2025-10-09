import { useMemo, useState } from 'react';
import './ViewReports.css'

function ViewReports() {
    const [searchQuery, setSearchQuery] = useState('');

    const status = useMemo(() =>[
        {type: 'open', name: 'Open'},
        {type: 'resolved', name: 'Resolved'},
        {type: 'in_review', name: 'In Review'}
    ])

    const reportsList = useMemo(() => [
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
                    {reportsList.map(report => (
                        <div key={report.id} className='report'>
                            <div className='report-header'>
                                <h3><strong>Report ID:</strong> {report.id}</h3>
                                <h3><strong>Type:</strong> {report.type}</h3>
                            </div>
                            <p><strong>Reported by:</strong> {report.reporterUserID}</p>
                            <div className='report-details'>
                                {
                                    report.type === 'product' ? (
                                        // Render product report
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
                        </div>
                    )
                    )}
                </div>
            </div>
        </div>);
}

export default ViewReports