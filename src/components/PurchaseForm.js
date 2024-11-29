// src/components/PurchaseForm.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { buyTokens } from '../redux/icoSlice';
import { setLoading, setError, addNotification } from '../redux/uiSlice';

export default function PurchaseForm() {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState('');
  
  // Redux selectors
  const { capICOContract } = useSelector((state) => state.contract);
  const { address: account } = useSelector((state) => state.wallet);
  const { tokenPrice, minInvestment, maxInvestment } = useSelector((state) => state.ico);
  const { loading, errors } = useSelector((state) => state.ui);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!capICOContract || !account) return;

    try {
      dispatch(setLoading({ type: 'purchase', isLoading: true }));
      dispatch(setError({ type: 'purchase', error: null }));

      const value = ethers.utils.parseEther(amount);
      const tx = await capICOContract.buyTokens(value, { value });
      await tx.wait();

      dispatch(addNotification({
        type: 'success',
        message: 'Purchase successful!',
        duration: 5000,
      }));
      setAmount('');
    } catch (error) {
      console.error('Purchase failed:', error);
      dispatch(setError({
        type: 'purchase',
        error: error.message || 'Purchase failed. Please try again.',
      }));
    } finally {
      dispatch(setLoading({ type: 'purchase', isLoading: false }));
    }
  };

  return (
    <form onSubmit={handlePurchase} className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Tokens</h2>
      
      {errors.purchase && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.purchase}
        </div>
      )}
      
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
          min={ethers.utils.formatEther(minInvestment || '0')}
          max={ethers.utils.formatEther(maxInvestment || '0')}
          step="0.01"
          required
          disabled={loading.purchase}
        />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Min: {ethers.utils.formatEther(minInvestment || '0')} ETH | 
        Max: {ethers.utils.formatEther(maxInvestment || '0')} ETH |
        Price per token: {ethers.utils.formatEther(tokenPrice || '0')} ETH
      </p>
      
      <button
        type="submit"
        className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          loading.purchase ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading.purchase}
      >
        {loading.purchase ? 'Processing...' : 'Purchase Tokens'}
      </button>
    </form>
  );
}

