import { useMemo } from 'react';
import { useTransaction } from '../../../contexts/TransactionContext';
import './TransactionsLog.css'

const formatTime = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}

const TransactionsLog = () => {
    const {
        stortedTransactions,
        isAdding,
        addTransaction,
        updateTransactionStatus,
        formatTime
    } = useTransaction();

    const statusMap = useMemo(() => ({
        processing: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Processing' },
        complete: { color: 'text-green-600', bg: 'bg-green-100', label: 'Complete' },
        stuck: { color: 'text-red-600', bg: 'bg-red-100', label: 'Stuck' },
        refunded: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Refunded' }
    }), []);

    return (
        <div className='container'>
            <h1 className='title'>
                Transactions Log
            </h1>
            <div className='list-container'>
                <div className=''>

                </div>
            </div>
        </div>
    )
}

export default TransactionsLog;