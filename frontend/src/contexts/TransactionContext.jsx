import { createContext, useCallback, useContext, useState } from "react";

const TransactionsContext = createContext();

const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'N/A';
    }
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
};

// --- Custom Mock Data (Static Demo List) ---
const DEMO_TRANSACTIONS = [
    {
        id: "tx-1001",
        status: "complete",
        time: new Date(Date.now() - 120000),
        fromBank: "Global Pay Inc.",
        toBank: "City Bank",
        amount: 150000,
        fromUser: "Fiona Glenanne",
        toUser: "Charlie Brown"
    },
    {
        id: "tx-1002",
        status: "stuck",
        time: new Date(Date.now() - 75000),
        fromBank: "Credit Union",
        toBank: "Bank A",
        amount: 98000,
        fromUser: "Charlie Brown",
        toUser: "Ethan Hunt"
    },
    {
        id: "tx-1003",
        status: "processing",
        time: new Date(Date.now() - 3000),
        fromBank: "Digital Wallet",
        toBank: "Bank B",
        amount: 460000,
        fromUser: "Bob Smith",
        toUser: "Ethan Hunt"
    },
    {
        id: "tx-1004",
        status: "refunded",
        time: new Date(Date.now() - 240000),
        fromBank: "State Finance",
        toBank: "Digital Wallet",
        amount: 100000,
        fromUser: "Fiona Glenanne",
        toUser: "Fiona Glenanne"
    }
]

export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(DEMO_TRANSACTIONS); // Demo only. Replace with [] later
    const [isAdding, setIsAdding] = useState(false);

    const isReady = true;

    const updateTransactionStatus = useCallback((id, newStatus) => {
        setTransactions(prev =>
            prev.map(t =>
                t.id === id ? { ...t, status: newStatus } : t
            )
        );
    }, []);

    /// TODO: Handle result code fro MoMo
    const handlePaymentNotification = {};

    /// TODO: Extract info from MoMo transaction to log
    const addTransaction = useCallback(() => {
        setIsAdding(true);

        const docId = crypto.randomUUID();

        // Mock 
        const newTransaction = {
            id: docId,
            fromUser: "mock user",
            toUserID: "mocked user",
            status: 'processing',
            time: new Date(),
            fromBank: 'Mock Bank A',
            toBank: 'Mock Bank B',
            amount: (Math.random() * 1000000).toPrecision(3)
        }

        setTransactions(prev => [newTransaction, ...prev]);

        // Demo only: simulate success transaction in 5s
        setTimeout(() => {
            updateTransactionStatus(docId, 'complete');
        }, 5000)

        setTimeout(setIsAdding(false), 500);
    }, [updateTransactionStatus]);

    const sortedTransactions = useMemo(() => {
        return transactions.toSorted((a, b) => b.time.getTime() - a.time.getTime());
    }, [transactions]);

    const value = {
        sortedTransactions,
        isAdding,
        addTransaction,
        updateTransactionStatus,
        formatTime
    };

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};
