import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #cccccc;
  }
`;

const ErrorMessage = styled.p`
  color: #ff0000;
`;

const TierInfo = styled.div`
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
`;

export default function TierManagement({ capicoContract }) {
  const [price, setPrice] = useState('');
  const [maxTokens, setMaxTokens] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    fetchTiers();
  }, [capicoContract]);

  const fetchTiers = async () => {
    if (!capicoContract) return;
    try {
      const tierCount = await capicoContract.tiers.length;
      const fetchedTiers = [];
      for (let i = 0; i < tierCount; i++) {
        const tier = await capicoContract.tiers(i);
        fetchedTiers.push({
          price: ethers.utils.formatEther(tier.price),
          maxTokens: ethers.utils.formatEther(tier.maxTokens),
          tokensSold: ethers.utils.formatEther(tier.tokensSold),
          startTime: new Date(tier.startTime.toNumber() * 1000).toISOString().slice(0, 16),
          endTime: new Date(tier.endTime.toNumber() * 1000).toISOString().slice(0, 16)
        });
      }
      setTiers(fetchedTiers);
    } catch (error) {
      console.error("Error fetching tiers:", error);
      setError("Failed to fetch tier information.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const priceInWei = ethers.utils.parseEther(price);
      const maxTokensInWei = ethers.utils.parseEther(maxTokens);
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);

      if (startTimeUnix <= Math.floor(Date.now() / 1000)) {
        throw new Error("Start time must be in the future");
      }

      if (endTimeUnix <= startTimeUnix) {
        throw new Error("End time must be after start time");
      }

      // Check for overlapping tiers
      for (const tier of tiers) {
        const tierStartTime = new Date(tier.startTime).getTime() / 1000;
        const tierEndTime = new Date(tier.endTime).getTime() / 1000;
        if (
          (startTimeUnix >= tierStartTime && startTimeUnix < tierEndTime) ||
          (endTimeUnix > tierStartTime && endTimeUnix <= tierEndTime) ||
          (startTimeUnix <= tierStartTime && endTimeUnix >= tierEndTime)
        ) {
          throw new Error("New tier overlaps with an existing tier");
        }
      }

      const tx = await capicoContract.addTier(priceInWei, maxTokensInWei, startTimeUnix, endTimeUnix);
      await tx.wait();
      alert('Tier added successfully!');
      setPrice('');
      setMaxTokens('');
      setStartTime('');
      setEndTime('');
      fetchTiers();
    } catch (error) {
      console.error("Error adding tier:", error);
      setError(`Failed to add tier: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Add New Tier</h3>
      <Form onSubmit={handleSubmit}>
        <Input
          type="number"
          step="0.000000000000000001"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price per token (ETH)"
          required
        />
        <Input
          type="number"
          step="1"
          value={maxTokens}
          onChange={(e) => setMaxTokens(e.target.value)}
          placeholder="Max tokens for this tier"
          required
        />
        <Input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Tier'}
        </Button>
      </Form>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <h3>Existing Tiers</h3>
      {tiers.map((tier, index) => (
        <TierInfo key={index}>
          <p>Tier {index + 1}</p>
          <p>Price: {tier.price} ETH</p>
          <p>Max Tokens: {tier.maxTokens}</p>
          <p>Tokens Sold: {tier.tokensSold}</p>
          <p>Start Time: {tier.startTime}</p>
          <p>End Time: {tier.endTime}</p>
        </TierInfo>
      ))}
    </div>
  );
}

