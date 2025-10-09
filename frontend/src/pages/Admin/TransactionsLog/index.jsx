const formatTime = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}

// --- Custom Mock Data (Static Demo List) ---
const DEMO_TRANSACTIONS = [
    {
        id: 'tx-1001',
        fromUser: 'Alice Johnson',
        toUser: 'Frank Miller',
        status: 'complete',
        time: new Date(Date.now() - 120000), // 2 minutes ago
        fromBank: 'Global Pay Inc.',
        toBank: 'City Bank',
        amount: '125.50',
    },
    {
        id: 'tx-1002',
        fromUser: 'Charlie Brown',
        toUser: 'Grace Hopper',
        status: 'stuck',
        time: new Date(Date.now() - 75000), // 1 minute 15 seconds ago
        fromBank: 'Credit Union',
        toBank: 'Bank A',
        amount: '899.00',
    },
    {
        id: 'tx-1003',
        fromUser: 'Eve Polastri',
        toUser: 'David Chen',
        status: 'processing',
        time: new Date(Date.now() - 3000), // 3 seconds ago
        fromBank: 'Digital Wallet',
        toBank: 'Bank B',
        amount: '45.75',
    },
    {
        id: 'tx-1004',
        fromUser: 'Bob Vance',
        toUser: 'Henry Jones',
        status: 'complete',
        time: new Date(Date.now() - 240000), // 4 minutes ago
        fromBank: 'State Finance',
        toBank: 'Digital Wallet',
        amount: '500.00',
    },
];