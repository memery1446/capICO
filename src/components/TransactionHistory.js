import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { withEthers } from '../withEthers';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { ethers } from 'ethers';

const TransactionHistory = ({ ethersService }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const isWalletConnected = useSelector((state) => state.referral.isWalletConnected);

  const getAddress = useCallback(async () => {
    if (ethersService && ethersService._service && isWalletConnected) {
      try {
        const address = await ethersService._service.getSignerAddress();
        setAddress(address);
      } catch (err) {
        console.error('Error getting address:', err);
        setError('Failed to get wallet address');
      }
    }
  }, [ethersService, isWalletConnected]);

  useEffect(() => {
    getAddress();
  }, [getAddress]);

  const fetchTransactions = useCallback(async () => {
    if (!ethersService || !ethersService._service || !isWalletConnected || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      const events = await ethersService._service.queryTransactionEvents(address);

      const formattedTransactions = await Promise.all(events.map(async (event) => {
        const block = await ethersService._service.getBlock(event.blockNumber);
        return {
          id: event.transactionHash,
          amount: ethers.utils.formatEther(event.args.amount),
          tokens: ethers.utils.formatEther(event.args.tokens),
          date: new Date(block.timestamp * 1000).toLocaleString(),
        };
      }));

      setTransactions(formattedTransactions.reverse()); // Most recent first
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [ethersService, isWalletConnected, address]);

  useEffect(() => {
    if (isWalletConnected && address) {
      fetchTransactions();
    }
  }, [isWalletConnected, address, fetchTransactions]);

  if (!isWalletConnected) {
    return <Card className="p-4">Please connect your wallet to view transaction history.</Card>;
  }

  if (isLoading) {
    return <Card className="p-4">Loading transaction history...</Card>;
  }

  if (error) {
    return <Card className="p-4 text-red-500">{error}</Card>;
  }

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <Button onClick={fetchTransactions} className="mb-4">
        Refresh Transactions
      </Button>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Amount (ETH)</th>
              <th className="border border-gray-300 px-4 py-2">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border border-gray-300 px-4 py-2">{tx.date}</td>
                <td className="border border-gray-300 px-4 py-2">{tx.amount}</td>
                <td className="border border-gray-300 px-4 py-2">{tx.tokens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default withEthers(TransactionHistory);

