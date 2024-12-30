// src/components/core/TokenPurchase.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { useICOStatus } from '../../hooks/useICOStatus';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

const TokenPurchase = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { contracts } = useSelector(state => state.contract);
  const { account, isWhitelisted } = useSelector(state => state.user);
  const { 
    isActive,
    tokenPrice,
    minInvestment,
    maxInvestment
  } = useICOStatus(contracts?.ico);

  const calculateTokens = (ethAmount) => {
    if (!ethAmount || !tokenPrice) return '0';
    return ethers.utils.parseEther(ethAmount).div(tokenPrice).toString();
  };

  const handlePurchase = async () => {
    if (!amount || !isActive || !account || !isWhitelisted) return;
    
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const tokenAmount = calculateTokens(amount);
      const tx = await contracts.ico.buyTokens(tokenAmount, {
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();

      setSuccess('Purchase successful! Check your wallet for tokens.');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <Card className="p-6">
        <Alert variant="warning">Please connect your wallet to purchase tokens.</Alert>
      </Card>
    );
  }

  if (!isWhitelisted) {
    return (
      <Card className="p-6">
        <Alert variant="warning">Your address needs to be whitelisted to participate.</Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Purchase Tokens</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount in ETH
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
            min={minInvestment}
            max={maxInvestment}
            step="0.01"
            disabled={!isActive || isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            You will receive: {calculateTokens(amount)} tokens
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <button
          onClick={handlePurchase}
          disabled={!isActive || !amount || isLoading}
          className={`w-full py-2 px-4 rounded font-medium ${
            isActive && !isLoading
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Processing...' : 'Purchase Tokens'}
        </button>

        <div className="text-sm text-gray-500">
          <p>Min Investment: {minInvestment} ETH</p>
          <p>Max Investment: {maxInvestment} ETH</p>
          <p>Token Price: {tokenPrice} ETH</p>
        </div>
      </div>
    </Card>
  );
};

export default TokenPurchase;

