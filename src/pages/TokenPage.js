import React from 'react';
import TokenBalance from '../components/token/TokenBalance';
import TransferTokens from '../components/token/TransferTokens';

const TokenPage = () => {
  return (
    <div className="token-page">
      <h1>Token Management</h1>
      <TokenBalance />
      <TransferTokens />
    </div>
  );
};

export default TokenPage;

