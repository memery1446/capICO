import React, { useState } from 'react';

const mockTransactions = [
  { id: 1, amount: 100, date: '2023-01-01 12:00:00' },
  { id: 2, amount: 200, date: '2023-01-02 14:30:00' },
  { id: 3, amount: 150, date: '2023-01-03 09:15:00' },
];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');

  const handleRefresh = () => {
    if (transactions.length) {
      setTransactions([]);
    } else {
      setTransactions([...mockTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  const handleSort = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
    setTransactions([...transactions].sort((a, b) => {
      return newSortOrder === 'desc' 
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    }));
  };

  return (
    <div data-testid="transaction-history" className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Your Transaction History</h3>
      {transactions.length > 0 ? (
        <>
          <button 
            onClick={handleSort}
            className="mb-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
          </button>
          <ul>
            {transactions.map(tx => (
              <li key={tx.id} data-testid="transaction-item" className="mb-2 p-2 bg-gray-100 rounded">
                <p>Amount: {tx.amount} tokens</p>
                <p>Date: {tx.date}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p data-testid="no-transactions" className="text-gray-600">No transactions found.</p>
      )}
      <button 
        onClick={handleRefresh}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {transactions.length ? 'Clear Transactions' : 'Refresh Transactions'}
      </button>
    </div>
  );
};

export default TransactionHistory;

