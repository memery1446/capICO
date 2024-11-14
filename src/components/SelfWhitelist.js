import React, { useState } from 'react';
import styled from 'styled-components';

const WhitelistWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
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
`;

export default function SelfWhitelist({ capicoContract, account, onWhitelistUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelfWhitelist = async () => {
    if (!capicoContract || !account) return;

    setIsLoading(true);
    setError(null);

    try {
      const tx = await capicoContract.addToWhitelist(account);
      await tx.wait();
      onWhitelistUpdate();
    } catch (error) {
      console.error('Error self-whitelisting:', error);
      setError('Failed to add yourself to the whitelist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhitelistWrapper>
      <h3>Self-Whitelist</h3>
      <p>Add yourself to the whitelist to participate in the ICO.</p>
      <Button onClick={handleSelfWhitelist} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Add to Whitelist'}
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </WhitelistWrapper>
  );
}

