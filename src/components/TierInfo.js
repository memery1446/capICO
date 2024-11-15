import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

const TierInfoWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

export default function TierInfo({ capicoContract }) {
  const [tierInfo, setTierInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTierInfo = async () => {
      if (!capicoContract) return;

      try {
        const currentTierIndex = await capicoContract.currentTier();
        const currentTier = await capicoContract.getCurrentTier();

        setTierInfo({
          price: ethers.utils.formatEther(currentTier.price),
          maxTokens: currentTier.maxTokens.toString(),
          tokensSold: currentTier.tokensSold.toString(),
          startTime: new Date(currentTier.startTime.toNumber() * 1000).toLocaleString(),
          endTime: new Date(currentTier.endTime.toNumber() * 1000).toLocaleString(),
        });
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

  if (!tierInfo) {
    return <TierInfoWrapper>Loading tier information...</TierInfoWrapper>;
  }

  return (
    <TierInfoWrapper>
      <h3>Current Tier Information</h3>
      <p>Price: {tierInfo.price} ETH</p>
      <p>Max Tokens: {tierInfo.maxTokens}</p>
      <p>Tokens Sold: {tierInfo.tokensSold}</p>
      <p>Start Time: {tierInfo.startTime}</p>
      <p>End Time: {tierInfo.endTime}</p>
    </TierInfoWrapper>
  );
}
