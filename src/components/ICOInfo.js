import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const InfoWrapper = styled.div`
  background-color: #594d5b;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  margin-bottom: 10px;
`;

export default function ICOInfo() {
  const { currentTier, totalTokensSold, softCap } = useSelector(state => state.ico);

  return (
    <InfoWrapper>
      <InfoItem>Current Tier: {currentTier}</InfoItem>
      <InfoItem>Total Tokens Sold: {totalTokensSold}</InfoItem>
      <InfoItem>Soft Cap: {softCap} ETH</InfoItem>
    </InfoWrapper>
  );
}
