import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { updateICOInfo } from '../store/icoSlice';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatAmount = (value) => {
  const number = parseFloat(value);
  return isNaN(number) ? "0.00" : number.toFixed(2);
};

const BuyTokens = () => {
  const [amount, setAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const tokenSymbol = useSelector((state) => state.ico.tokenSymbol);
  const tokenPrice = useSelector((state) => state.ico.tokenPrice);
  const dispatch = useDispatch();

  const checkCooldown = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        const address = await signer.getAddress();
        const timeLeft = await contract.cooldownTimeLeft(address);
        setCooldownTimeLeft(timeLeft.toNumber());
      } catch (error) {
        console.error('Error checking cooldown:', error);
      }
    }
  }, []);

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(() => {
      setCooldownTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [checkCooldown]);

  const handleBuy = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (cooldownTimeLeft > 0) {
      setError(`Cooldown period not over. Please wait ${formatTime(cooldownTimeLeft)} before making another purchase.`);
      setIsLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

      const tx = await contract.buyTokens({ value: ethers.utils.parseEther(formatAmount(amount)) });
      await tx.wait();

      setSuccessMessage(`Successfully purchased tokens!`);
      setAmount(''); // Clear the input after successful purchase
      setReferrer('');

      // Update ICO info after successful purchase
      // const tokenBalance = await contract.balanceOf(await signer.getAddress());
      // dispatch(updateICOInfo({ tokenBalance: tokenBalance.toString() }));

      checkCooldown(); // Refresh cooldown time
    } catch (error) {
      console.error('Error buying tokens:', error);
      setError('Failed to buy tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTokens = amount && tokenPrice ? parseFloat(formatAmount(amount)) / parseFloat(tokenPrice) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Buy Tokens</h2>
      <form onSubmit={handleBuy}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount of ETH to spend</label>
          <div className="flex items-center">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
            <div className="flex flex-col ml-2">
              <button
                type="button"
                onClick={() => setAmount(prev => (parseFloat(prev) + 0.01).toFixed(2))}
                className="bg-gray-200 px-2 py-1 rounded-t"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setAmount(prev => Math.max(0, parseFloat(prev) - 0.01).toFixed(2))}
                className="bg-gray-200 px-2 py-1 rounded-b"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="referrer" className="block text-sm font-medium text-gray-700">Referrer Address (optional)</label>
          <input
            type="text"
            id="referrer"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <p className="mb-4">Current token price: {tokenPrice} ETH per {tokenSymbol}</p>
        <p className="mb-4">Estimated tokens to receive: {estimatedTokens.toFixed(2)} {tokenSymbol}</p>
        {cooldownTimeLeft > 0 && (
          <p className="mb-4 text-yellow-600">Cooldown period: {formatTime(cooldownTimeLeft)} remaining</p>
        )}
        <button
          type="submit"
          disabled={isLoading || cooldownTimeLeft > 0}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Buy Tokens'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}
    </div>
  );
};

export default BuyTokens;

