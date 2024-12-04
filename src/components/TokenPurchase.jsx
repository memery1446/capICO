import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { buyTokens } from '../redux/actions';

const TokenPurchase = () => {
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();

  const handlePurchase = (e) => {
    e.preventDefault();
    dispatch(buyTokens(parseFloat(amount)));
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Purchase Tokens</h2>
      <form onSubmit={handlePurchase} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (ETH)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Buy Tokens
        </button>
      </form>
    </div>
  );
};

export default TokenPurchase;


