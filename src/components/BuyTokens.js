import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const BuyTokens = ({ onPurchase }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleBuy = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

      console.log('Buying tokens...');
      console.log('Contract address:', ICO_ADDRESS);
      console.log('Amount:', amount);

      const tx = await contract.buyTokens({ value: ethers.utils.parseEther(amount) });
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);

      setSuccessMessage(`Successfully purchased tokens! Transaction hash: ${receipt.transactionHash}`);
      setAmount('');
      if (onPurchase) onPurchase();
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Failed to buy tokens: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Buy Tokens</h3>
      <form onSubmit={handleBuy}>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ETH"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Buying...' : 'Buy Tokens'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
    </div>
  );
};

export default BuyTokens;

