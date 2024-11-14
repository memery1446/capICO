import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const InfoWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
`;

export default function AccountInfo() {
  const { account, balance } = useSelector(state => state.account);

  return (
    <InfoWrapper>
      <h2>Account Information</h2>
      <p>Address: {account}</p>
      <p>Balance: {balance} ETH</p>
    </InfoWrapper>
  );
}
