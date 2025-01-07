import React, { useState } from 'react';

const TransactionHistory = () => {
  const [hasTransaction, setHasTransaction] = useState(false);

  const handleRefresh = () => {
    setHasTransaction(prev => !prev);
  };

  return (
    <div data-testid="transaction-history" className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Your Transaction History</h3>
      {hasTransaction ? (
        <ul>
          <li data-testid="transaction-item" className="mb-2 p-2 bg-gray-100 rounded">
            <p>Amount: 100 tokens</p>
            <p>Date: 2023-01-01 12:00:00</p>
          </li>
        </ul>
      ) : (
        <p data-testid="no-transactions" className="text-gray-600">No transactions found.</p>
      )}
      <button 
        onClick={handleRefresh}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Refresh Transactions
      </button>
    </div>
  );
};

export default TransactionHistory;

