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

const InfoMessage = styled.p`
  color: #4ecdc4;
  font-weight: bold;
`;

export default function PurchaseForm({ capicoContract, account }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);
  const [isTierActive, setIsTierActive] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const fetchCurrentTier = async () => {
    if (!capicoContract) return;

    try {
      const tier = await capicoContract.getCurrentTier();
      const now = Math.floor(Date.now() / 1000);
      setCurrentTier({
        price: tier.price,
        maxTokens: tier.maxTokens,
        tokensSold: tier.tokensSold,
        startTime: tier.startTime.toNumber(),
        endTime: tier.endTime.toNumber()
      });
      setIsTierActive(now >= tier.startTime.toNumber() && now < tier.endTime.toNumber());
      setError(null);
    } catch (error) {
      console.error("Error fetching current tier:", error);
      setError("Failed to fetch current tier information.");
      setCurrentTier(null);
      setIsTierActive(false);
    }
  };

  const checkWhitelistStatus = async () => {
    if (!capicoContract || !account) return;

    try {
      const status = await capicoContract.whitelist(account);
      setIsWhitelisted(status);
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      setError("Failed to check whitelist status.");
    }
  };

  useEffect(() => {
    fetchCurrentTier();
    checkWhitelistStatus();
    const interval = setInterval(fetchCurrentTier, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [capicoContract, account]);

  const advanceTier = async () => {
    if (!capicoContract) return;

    try {
      setIsLoading(true);
      const tx = await capicoContract.advanceTier();
      await tx.wait();
      await fetchCurrentTier();
      setIsLoading(false);
    } catch (error) {
      console.error("Error advancing tier:", error);
      setError("Failed to advance to the next tier. Please try again.");
      setIsLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!capicoContract || !account || !currentTier || !isTierActive || !isWhitelisted) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountInWei = ethers.utils.parseEther(amount);
      const tokenAmount = amountInWei.mul(ethers.utils.parseEther('1')).div(currentTier.price);

      const tx = await capicoContract.buyTokens(tokenAmount, { value: amountInWei });
      await tx.wait();

      setAmount('');
      alert('Tokens purchased successfully!');
      await fetchCurrentTier();
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError(`Failed to purchase tokens: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentTier) {
    return <p>{error || "No tier information available. Please check back later."}</p>;
  }

  return (
    <FormWrapper>
      <h3>Current Tier Information</h3>
      <p>Price: {ethers.utils.formatEther(currentTier.price)} ETH per token</p>
      <p>Tokens Available: {ethers.utils.formatUnits(currentTier.maxTokens.sub(currentTier.tokensSold), 18)}</p>
      <p>Tier Starts: {new Date(currentTier.startTime * 1000).toLocaleString()}</p>
      <p>Tier Ends: {new Date(currentTier.endTime * 1000).toLocaleString()}</p>
      
      {!isWhitelisted && (
        <InfoMessage>You are not whitelisted. Please contact the administrator to be added to the whitelist.</InfoMessage>
      )}
      
      {isTierActive && isWhitelisted ? (
        <>
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
        </>
      ) : (
        <InfoMessage>
          {isWhitelisted ? 
            `This tier is not currently active. It will ${currentTier.startTime * 1000 > Date.now() ? 'start' : 'end'} on ${new Date(currentTier.startTime * 1000 > Date.now() ? currentTier.startTime * 1000 : currentTier.endTime * 1000).toLocaleString()}.` : 
            'You need to be whitelisted to participate in the ICO.'}
        </InfoMessage>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormWrapper>
  );
}

