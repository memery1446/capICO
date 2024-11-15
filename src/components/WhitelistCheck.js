import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WhitelistWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const StatusText = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.$isWhitelisted ? '#4CAF50' : '#FF5722'};
`;

export default function WhitelistCheck({ capicoContract, account }) {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (!capicoContract || !account) return;

      try {
        const status = await capicoContract.whitelist(account);
        console.log('Whitelist status:', status); // Add this line for debugging
        setIsWhitelisted(status);
        setError(null);
      } catch (error) {
        console.error('Error checking whitelist status:', error);
        setError('Failed to check whitelist status. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    checkWhitelistStatus();
  }, [capicoContract, account]);

  if (isLoading) {
    return <WhitelistWrapper>Checking whitelist status...</WhitelistWrapper>;
  }

  if (error) {
    return <WhitelistWrapper>{error}</WhitelistWrapper>;
  }

  return (
    <WhitelistWrapper>
      <h3>Whitelist Status</h3>
      <StatusText $isWhitelisted={isWhitelisted}>
        Your address ({account}) is {isWhitelisted ? 'whitelisted' : 'not whitelisted'} for this ICO.
      </StatusText>
    </WhitelistWrapper>
  );
}
