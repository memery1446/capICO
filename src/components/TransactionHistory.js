import React, { useState, useEffect } from 'react';

const mockTransactions = [
  { id: 1, amount: 100, date: '2023-01-01 12:00:00' },
  { id: 2, amount: 200, date: '2023-01-02 14:30:00' },
  { id: 3, amount: 150, date: '2023-01-03 09:15:00' },
];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterAmount, setFilterAmount] = useState('');

  useEffect(() => {
    if (transactions.length > 0) {
      applyFilterAndSort();
    }
  }, [filterAmount, sortOrder, transactions.length]);

  const handleRefresh = () => {
    setFilterAmount('');
    if (transactions.length) {
      setTransactions([]);
    } else {
      setTransactions([...mockTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  const handleSort = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleFilterChange = (e) => {
    setFilterAmount(e.target.value);
  };

  const applyFilterAndSort = () => {
    let filteredAndSortedTransactions = [...mockTransactions];

    if (filterAmount && !isNaN(filterAmount) && parseInt(filterAmount, 10) >= 0) {
      filteredAndSortedTransactions = filteredAndSortedTransactions.filter(
        tx => tx.amount >= parseInt(filterAmount, 10)
      );
    }

    filteredAndSortedTransactions.sort((a, b) => {
      return sortOrder === 'desc'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    });

    setTransactions(filteredAndSortedTransactions);
  };

  return (
    <div data-testid="transaction-history" className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Your Transaction History</h3>
      {transactions.length > 0 ? (
        <>
          <div className="mb-4 flex items-center">
            <button 
              onClick={handleSort}
              className="mr-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
              Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
            </button>
            <label htmlFor="filter-amount" className="mr-2">Filter by min amount:</label>
            <input
              id="filter-amount"
              type="number"
              value={filterAmount}
              onChange={handleFilterChange}
              className="px-2 py-1 border rounded"
              placeholder="Enter amount"
            />
          </div>
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

