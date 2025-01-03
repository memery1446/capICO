import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
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

        setTransactions(txHistory);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        setError('Failed to fetch transaction history. Please try again.');
      }
    } else {
      setError('MetaMask is not installed. Please install it to interact with this dApp.');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Your Transaction History</h3>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((tx, index) => (
            <li key={index}>
              {tx.timestamp}: Purchased {tx.amount} tokens
              <br />
              <a href={`https://etherscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                View on Etherscan
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;

