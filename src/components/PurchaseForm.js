import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function PurchaseForm({ capICOContract, account }) {
  const [amount, setAmount] = useState('');
  const [minInvestment, setMinInvestment] = useState('0');
  const [maxInvestment, setMaxInvestment] = useState('0');

  useEffect(() => {
    const fetchInvestmentLimits = async () => {
      if (capICOContract) {
        const min = await capICOContract.minInvestment();
        const max = await capICOContract.maxInvestment();
        setMinInvestment(ethers.utils.formatEther(min));
        setMaxInvestment(ethers.utils.formatEther(max));
      }
    };
    fetchInvestmentLimits();
  }, [capICOContract]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!capICOContract) return;
    try {
      const value = ethers.utils.parseEther(amount);
      const tx = await capICOContract.buyTokens(ethers.utils.parseEther(amount), { value });
      await tx.wait();
      alert('Purchase successful!');
      setAmount('');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. See console for details.');
    }
  };

  return (
    <form onSubmit={handlePurchase} className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Tokens</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
          Amount (ETH)
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in ETH"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          min={minInvestment}
          max={maxInvestment}
          step="0.01"
          required
        />
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Min: {minInvestment} ETH | Max: {maxInvestment} ETH
      </p>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Purchase Tokens
      </button>
    </form>
  );
}

