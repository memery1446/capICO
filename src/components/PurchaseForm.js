import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

const FormWrapper = styled.div`
  margin-top: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-weight: bold;
`;

export default function PurchaseForm({ capicoContract, account, tiers, onPurchase }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);

  useEffect(() => {
    const updateCurrentTier = () => {
      const now = Math.floor(Date.now() / 1000);
      const activeTier = tiers.find(tier => now >= tier.startTime && now < tier.endTime);
      setCurrentTier(activeTier);
    };

    updateCurrentTier();
    const interval = setInterval(updateCurrentTier, 1000);

    return () => clearInterval(interval);
  }, [tiers]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!capicoContract || !account || !currentTier) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountInWei = ethers.utils.parseEther(amount);
      const tokenAmount = amountInWei.mul(ethers.utils.parseEther('1')).div(ethers.BigNumber.from(currentTier.price));

      const tokensSold = ethers.BigNumber.from(currentTier.tokensSold);
      const maxTokens = ethers.BigNumber.from(currentTier.maxTokens);

      if (tokensSold.add(tokenAmount).gt(maxTokens)) {
        throw new Error('Purchase would exceed tier capacity');
      }

      const availableTokens = maxTokens.sub(tokensSold);
      if (tokenAmount.gt(availableTokens)) {
        throw new Error(`Only ${ethers.utils.formatUnits(availableTokens, 18)} tokens available in this tier`);
      }

      const tx = await capicoContract.buyTokens(tokenAmount, { value: amountInWei });
      await tx.wait();
      
      const updatedTier = {
        ...currentTier,
        tokensSold: tokensSold.add(tokenAmount).toString()
      };
      onPurchase(updatedTier);

      setAmount('');
      alert('Tokens purchased successfully!');
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError(`Failed to purchase tokens: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentTier) {
    return <p>No active tier at the moment. Please check back later.</p>;
  }

  return (
    <FormWrapper>
      <h3>Current Tier Information</h3>
      <p>Price: {ethers.utils.formatEther(currentTier.price)} ETH per token</p>
      <p>Tokens Available: {ethers.utils.formatUnits(ethers.BigNumber.from(currentTier.maxTokens).sub(ethers.BigNumber.from(currentTier.tokensSold)), 18)}</p>
      <p>Tier Ends: {new Date(currentTier.endTime * 1000).toLocaleString()}</p>
      
      <h3>Buy Tokens</h3>
      <form onSubmit={handlePurchase}>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in ETH"
        />
        <Button type="submit" disabled={isLoading || !amount}>
          {isLoading ? 'Processing...' : 'Purchase Tokens'}
        </Button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormWrapper>
  );
}
