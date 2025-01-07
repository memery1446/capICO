import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const TransactionHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install it to interact with this dApp.');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
      const address = await signer.getAddress();

      const filter = contract.filters.TokensPurchased();
      const events = await contract.queryFilter(filter);

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

      setTransactions(txHistory.reverse());
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError(err.message || 'Failed to fetch transaction history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div data-testid="loading">Loading transaction history...</div>;
  }

  if (error) {
    return <div data-testid="error">Error: {error}</div>;
  }

  return (
    <div data-testid="transaction-history">
      <h3>Your Transaction History</h3>
      {transactions.length === 0 ? (
        <p data-testid="no-transactions">No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((tx, index) => (
            <li key={tx.transactionHash} data-testid={`transaction-${index}`}>
              <p>Amount: {tx.amount} tokens</p>
              <p>Date: {tx.timestamp}</p>
              <a 
                href={`https://etherscan.io/tx/${tx.transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Etherscan
              </a>
            </li>
          ))}
        </ul>
      )}
      <button 
        onClick={fetchTransactionHistory} 
        data-testid="refresh-button"
      >
        Refresh Transactions
      </button>
    </div>
  );
};

export default TransactionHistory;

