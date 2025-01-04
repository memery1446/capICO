import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { setCooldownTimeLeft, setTransactionHistory } from '../store/icoSlice';

const BuyTokens = ({ onPurchase }) => {
  const [amount, setAmount] = useState('0.00');
  const [demoTokens, setDemoTokens] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState('');
  
  const dispatch = useDispatch();
  const cooldownTimeLeft = useSelector((state) => state.ico.cooldownTimeLeft);
  const isCooldownEnabled = useSelector((state) => state.ico.isCooldownEnabled);
  const tokenPrice = useSelector((state) => state.ico.tokenPrice);

  const fetchCooldownTime = async () => {
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

  useEffect(() => {
    fetchCooldownTime();
    const interval = setInterval(fetchCooldownTime, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (cooldownTimeLeft > 0) {
        dispatch(setCooldownTimeLeft(cooldownTimeLeft - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTimeLeft, dispatch]);

  useEffect(() => {
    if (cooldownTimeLeft > 0) {
      const minutes = Math.floor(cooldownTimeLeft / 60);
      const seconds = cooldownTimeLeft % 60;
      setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setCountdown('');
    }
  }, [cooldownTimeLeft]);

  useEffect(() => {
    if (tokenPrice && amount) {
      const tokens = parseFloat(amount) / parseFloat(tokenPrice);
      setDemoTokens(tokens.toFixed(2));
    }
  }, [amount, tokenPrice]);

  const handleAmountChange = (e) => {
    let value = e.target.value;
    // Ensure the value has at most 2 decimal places
    value = value.replace(/(\.\d{2})\d+/, '$1');
    setAmount(value);
  };

  const adjustAmount = (delta) => {
    const currentAmount = parseFloat(amount);
    const newAmount = Math.max(0, currentAmount + delta).toFixed(2);
    setAmount(newAmount);
  };

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

      setSuccessMessage(`Successfully purchased ${demoTokens} DEMO tokens!`);
      setAmount('0.00');
      onPurchase();
      fetchCooldownTime(); // Refresh cooldown time after purchase
      dispatch(setTransactionHistory([])); // This will trigger a re-fetch in the TransactionHistory component
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
      {isCooldownEnabled ? (
        countdown ? (
          <p className="mb-4 text-yellow-600">Cooldown period active. You can buy again in {countdown}</p>
        ) : (
          <p className="mb-4 text-green-600">Cooldown is enabled, but not active. You can make a purchase.</p>
        )
      ) : (
        <form onSubmit={handleBuy}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (ETH)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                step="0.01"
                min="0"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-20 sm:text-sm border-gray-300 rounded-md"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => adjustAmount(0.01)}
                  className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => adjustAmount(-0.01)}
                  className="ml-1 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You will receive approximately {demoTokens} DEMO tokens
          </p>
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

