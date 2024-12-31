import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { buyTokens } from '../../features/ico/icoSlice';
import web3Service from '../../services/web3Service';

const BuyTokensForm = () => {
  const [amount, setAmount] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const dispatch = useDispatch();
  const { isLoading, error, success } = useSelector((state) => state.ico);

  useEffect(() => {
    const checkCooldown = async () => {
      try {
        const address = await web3Service.signer.getAddress();
        const remainingCooldown = await web3Service.getTransferCooldownTime(address);
        setCooldownTime(remainingCooldown);
      } catch (err) {
        console.error('Error checking cooldown:', err);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = async (e) => {
    e.preventDefault();
    try {
      await dispatch(buyTokens(amount));
      setAmount('');
    } catch (err) {
      console.error('Error buying tokens:', err);
    }
  };

  const formatCooldownTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="buy-tokens-form">
      <h2>Buy Tokens</h2>
      <form onSubmit={handleBuy}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ETH"
          min="0"
          step="0.01"
          required
        />
        <button type="submit" disabled={isLoading || cooldownTime > 0}>
          {isLoading ? 'Processing...' : 'Buy Tokens'}
        </button>
      </form>
      {cooldownTime > 0 && (
        <p className="cooldown-message">
          Transfer cooldown active. Please wait {formatCooldownTime(cooldownTime)} before making another purchase.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default BuyTokensForm;

