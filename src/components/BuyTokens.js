import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { setCooldownTimeLeft } from '../store/icoSlice';

const BuyTokens = ({ onPurchase }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const dispatch = useDispatch();
  const cooldownTimeLeft = useSelector((state) => state.ico.cooldownTimeLeft);

  useEffect(() => {
    const checkCooldown = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
          const address = await signer.getAddress();
          const timeLeft = await contract.cooldownTimeLeft(address);
          dispatch(setCooldownTimeLeft(timeLeft.toNumber()));
        } catch (error) {
          console.error('Error checking cooldown:', error);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000); // Check every second
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleBuy = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

      const tx = await contract.buyTokens({ value: ethers.utils.parseEther(amount) });
      await tx.wait();

      setSuccessMessage(`Successfully purchased tokens!`);
      setAmount('');
      onPurchase();
    } catch (err) {
      setError('Error purchasing tokens. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Buy Tokens</h3>
      {cooldownTimeLeft > 0 ? (
        <p>Cooldown period active. Please wait {cooldownTimeLeft} seconds before purchasing again.</p>
      ) : (
        <form onSubmit={handleBuy}>
          <div className="mb-4">
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
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Buy Tokens'}
          </button>
        </form>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
    </div>
  );
};

export default BuyTokens;

