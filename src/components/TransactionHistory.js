import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

// Add this action to your icoSlice.js file
// export const setTransactionHistory = (transactions) => ({ type: 'ico/setTransactionHistory', payload: transactions });

const TransactionHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.ico.transactionHistory || []);

  const fetchTransactionHistory = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        setError(null);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
        const address = await signer.getAddress();

        // Fetch all TokensPurchased events
        const filter = contract.filters.TokensPurchased();
        const events = await contract.queryFilter(filter);

        // Filter events for the current user and format them
        const txHistory = await Promise.all(events
          .filter(event => event.args.buyer.toLowerCase() === address.toLowerCase())
          .map(async (event) => {
            const block = await event.getBlock();
            return {
              transactionHash: event.transactionHash,
              amount: ethers.utils.formatEther(event.args.amount),
              timestamp: new Date(block.timestamp * 1000).toLocaleString(),
            };
          }));

        dispatch({ type: 'ico/setTransactionHistory', payload: txHistory.reverse() }); // Show most recent transactions first
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        setError('Failed to fetch transaction history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('MetaMask is not installed. Please install it to interact with this dApp.');
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
    // Set up an interval to fetch transactions every 30 seconds
    const interval = setInterval(fetchTransactionHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="bg-white p-6 rounded-lg shadow-md mt-4">Loading transaction history...</div>;
  }

  if (error) {
    return <div className="bg-white p-6 rounded-lg shadow-md mt-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Your Transaction History</h3>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx, index) => (
            <li key={index} className="border-b pb-2">
              <p><strong>Date:</strong> {tx.timestamp}</p>
              <p><strong>Amount:</strong> {tx.amount} tokens</p>
              <a 
                href={`https://etherscan.io/tx/${tx.transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Etherscan
              </a>
            </li>
          ))}
        </ul>
      )}
      <button 
        onClick={fetchTransactionHistory} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Transactions
      </button>
    </div>
  );
};

export default TransactionHistory;

