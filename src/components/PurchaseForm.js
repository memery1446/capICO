import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function PurchaseForm({ capICOContract, signer }) {
  const [amount, setAmount] = useState('');

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (capICOContract && signer) {
      try {
        const tokenAmount = ethers.utils.parseEther(amount);
        const tx = await capICOContract.connect(signer).buyTokens(tokenAmount, {
          value: tokenAmount,
        });
        await tx.wait();
        alert('Purchase successful!');
        setAmount('');
      } catch (error) {
        console.error('Purchase failed:', error);
        alert('Purchase failed. Please check console for details.');
      }
    }
  };

  return (
    <form onSubmit={handlePurchase} className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Purchase Tokens</h2>
      <div className="flex gap-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount of tokens"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Buy
        </button>
      </div>
    </form>
  );
}

