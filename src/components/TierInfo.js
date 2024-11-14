import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

const TierInfoWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const TierItem = styled.div`
  margin-bottom: 10px;
`;

export default function TierInfo({ capicoContract }) {
  const [currentTier, setCurrentTier] = useState(null);
  const [allTiers, setAllTiers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTierInfo = async () => {
      if (!capicoContract) return;

      try {
        const currentTierInfo = await capicoContract.getCurrentTier({});
        setCurrentTier(currentTierInfo);

        const tiersCount = await capicoContract.currentTier({});
        const tiers = [];
        for (let i = 0; i <= tiersCount.toNumber(); i++) {
          const tier = await capicoContract.tiers(i, {});
          tiers.push(tier);
        }
        setAllTiers(tiers);
        setError(null);
      } catch (error) {
        console.error('Error fetching tier info:', error);
        setError('Failed to fetch tier information. Please try again later.');
      }
    };

    fetchTierInfo();
  }, [capicoContract]);

  if (error) {
    return <TierInfoWrapper>{error}</TierInfoWrapper>;
  }

  if (!currentTier) {
    return <TierInfoWrapper>Loading tier information...</TierInfoWrapper>;
  }

  return (
    <TierInfoWrapper>
      <h3>Current Tier Information</h3>
      <TierItem>Price: {ethers.utils.formatEther(currentTier.price)} ETH</TierItem>
      <TierItem>Max Tokens: {ethers.utils.formatEther(currentTier.maxTokens)}</TierItem>
      <TierItem>Tokens Sold: {ethers.utils.formatEther(currentTier.tokensSold)}</TierItem>
      <TierItem>Start Time: {new Date(currentTier.startTime.toNumber() * 1000).toLocaleString()}</TierItem>
      <TierItem>End Time: {new Date(currentTier.endTime.toNumber() * 1000).toLocaleString()}</TierItem>

      <h3>All Tiers</h3>
      {allTiers.map((tier, index) => (
        <div key={index}>
          <h4>Tier {index + 1}</h4>
          <TierItem>Price: {ethers.utils.formatEther(tier.price)} ETH</TierItem>
          <TierItem>Max Tokens: {ethers.utils.formatEther(tier.maxTokens)}</TierItem>
          <TierItem>Tokens Sold: {ethers.utils.formatEther(tier.tokensSold)}</TierItem>
          <TierItem>Start Time: {new Date(tier.startTime.toNumber() * 1000).toLocaleString()}</TierItem>
          <TierItem>End Time: {new Date(tier.endTime.toNumber() * 1000).toLocaleString()}</TierItem>
        </div>
      ))}
    </TierInfoWrapper>
  );
}
