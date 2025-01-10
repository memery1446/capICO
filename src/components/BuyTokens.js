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

const getErrorMessage = (error) => {
  if (!window.ethereum) return 'Please install MetaMask to continue.';
  if (error?.code === 4001) return 'Transaction was rejected in MetaMask.';
  if (error?.code === -32603) return 'Insufficient balance for transaction.';
  if (error?.message?.includes('cooldown')) return 'Please wait for cooldown period to end.';
  if (error?.message?.includes('whitelist')) return 'Your address is not whitelisted.';
  if (error?.message?.includes('hardcap')) return 'Purchase would exceed ICO hard cap.';
  return 'Failed to buy tokens. Please try again.';
};

const BuyTokens = () => {
  const [amount, setAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');
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
    setTxStatus('');
    setTxHash('');

    if (cooldownTimeLeft > 0) {
      setError(`Cooldown period not over. Please wait ${formatTime(cooldownTimeLeft)} before making another purchase.`);
      setIsLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

      setTxStatus('Awaiting wallet approval...');
      const tx = await contract.buyTokens({ value: ethers.utils.parseEther(formatAmount(amount)) });
      setTxStatus('Transaction submitted...');
      setTxHash(tx.hash);

      await tx.wait();
      setTxStatus('Transaction confirmed!');
      setSuccessMessage(`Successfully purchased tokens!`);
      setAmount('');
      setReferrer('');

      checkCooldown();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setTxStatus('');
        setTxHash('');
      }, 5000);
    } catch (error) {
      console.error('Error buying tokens:', error);
      setError(getErrorMessage(error));
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
                className="bg-gray-200 px-2 py-1 rounded-t hover:bg-gray-300"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setAmount(prev => Math.max(0, parseFloat(prev) - 0.01).toFixed(2))}
                className="bg-gray-200 px-2 py-1 rounded-b hover:bg-gray-300"
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
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">Current token price: <span className="font-medium">{tokenPrice} ETH</span> per {tokenSymbol}</p>
          <p className="text-gray-600">Estimated tokens to receive: <span className="font-medium">{estimatedTokens.toFixed(2)} {tokenSymbol}</span></p>
        </div>
        {cooldownTimeLeft > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-yellow-600">Cooldown period: {formatTime(cooldownTimeLeft)} remaining</p>
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || cooldownTimeLeft > 0}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition duration-150"
        >
          {isLoading ? 'Processing...' : 'Buy Tokens'}
        </button>
      </form>
      {txStatus && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <p className="text-blue-600">{txStatus}</p>
          </div>
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700 mt-2 inline-block"
            >
              View transaction on Etherscan ↗
            </a>
          )}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default BuyTokens;

