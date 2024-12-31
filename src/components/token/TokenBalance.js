import React, { useState, useEffect } from 'react';
import web3Service from '../../services/web3Service';

const TokenBalance = () => {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userBalance = await web3Service.getTokenBalance();
        setBalance(userBalance);
      } catch (err) {
        console.error('Error fetching token balance:', err);
        setError(err.message || 'Failed to fetch token balance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (isLoading) {
    return <div>Loading balance...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="token-balance">
      <h3>Your Token Balance</h3>
      <p>{balance} Tokens</p>
    </div>
  );
};

export default TokenBalance;

