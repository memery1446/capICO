import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

const TierManagementWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
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

const TierList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TierItem = styled.li`
  background-color: ${props => props.$isActive ? '#4a4a4a' : '#3a3a3a'};
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-weight: bold;
`;

export default function TierManagement({ onTierUpdate }) {
  const [tiers, setTiers] = useState([]);
  const [price, setPrice] = useState('');
  const [maxTokens, setMaxTokens] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedTiers = localStorage.getItem('icotiers');
    if (storedTiers) {
      setTiers(JSON.parse(storedTiers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('icotiers', JSON.stringify(tiers));
    if (onTierUpdate) {
      onTierUpdate(tiers);
    }
  }, [tiers, onTierUpdate]);

  const validateTier = (newTier, index = -1) => {
    if (newTier.startTime >= newTier.endTime) {
      setError('End time must be after start time');
      return false;
    }

    for (let i = 0; i < tiers.length; i++) {
      if (i === index) continue;
      const tier = tiers[i];
      if ((newTier.startTime < tier.endTime && newTier.endTime > tier.startTime) ||
          (tier.startTime < newTier.endTime && tier.endTime > newTier.startTime)) {
        setError('Tiers cannot overlap in time');
        return false;
      }
    }

    setError('');
    return true;
  };

  const addOrUpdateTier = () => {
    const newTier = {
      price: ethers.utils.parseEther(price),
      maxTokens: ethers.utils.parseUnits(maxTokens, 18),
      startTime: new Date(startTime).getTime() / 1000,
      endTime: new Date(endTime).getTime() / 1000,
      tokensSold: editingIndex >= 0 ? tiers[editingIndex].tokensSold : 0
    };

    if (!validateTier(newTier, editingIndex)) return;

    if (editingIndex >= 0) {
      const updatedTiers = [...tiers];
      updatedTiers[editingIndex] = newTier;
      setTiers(updatedTiers);
    } else {
      setTiers([...tiers, newTier].sort((a, b) => a.startTime - b.startTime));
    }

    setPrice('');
    setMaxTokens('');
    setStartTime('');
    setEndTime('');
    setEditingIndex(-1);
  };

  const editTier = (index) => {
    const tier = tiers[index];
    setPrice(ethers.utils.formatEther(tier.price));
    setMaxTokens(ethers.utils.formatUnits(tier.maxTokens, 18));
    setStartTime(new Date(tier.startTime * 1000).toISOString().slice(0, 16));
    setEndTime(new Date(tier.endTime * 1000).toISOString().slice(0, 16));
    setEditingIndex(index);
  };

  const deleteTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const isActiveTier = (tier) => {
    const now = Date.now() / 1000;
    return now >= tier.startTime && now < tier.endTime;
  };

  return (
    <TierManagementWrapper>
      <h3>Tier Management</h3>
      <FormGroup>
        <Label htmlFor="price">Price (in ETH)</Label>
        <Input
          id="price"
          type="number"
          step="0.000000000000000001"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="startTime">Tier Start Time</Label>
        <Input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="endTime">Tier End Time</Label>
        <Input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </FormGroup>
      <Button onClick={addOrUpdateTier} disabled={!price || !maxTokens || !startTime || !endTime}>
        {editingIndex >= 0 ? 'Update Tier' : 'Add Tier'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <TierList>
        {tiers.map((tier, index) => (
          <TierItem key={index} $isActive={isActiveTier(tier)}>
            <p>Price: {ethers.utils.formatEther(tier.price)} ETH</p>
            <p>Max Tokens: {ethers.utils.formatUnits(tier.maxTokens, 18)}</p>
            <p>Start: {new Date(tier.startTime * 1000).toLocaleString()}</p>
            <p>End: {new Date(tier.endTime * 1000).toLocaleString()}</p>
            <p>Tokens Sold: {ethers.utils.formatUnits(tier.tokensSold, 18)}</p>
            <p>{isActiveTier(tier) ? 'Active' : 'Inactive'}</p>
            <Button onClick={() => editTier(index)}>Edit</Button>
            <Button onClick={() => deleteTier(index)}>Delete</Button>
          </TierItem>
        ))}
      </TierList>
    </TierManagementWrapper>
  );
}

