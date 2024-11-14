import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WhitelistWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

export default function WhitelistCheck({ capicoContract, account }) {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkWhitelist = async () => {
      if (!capicoContract || !account) return;

      try {
        const whitelistStatus = await capicoContract.whitelist(account, {});
        setIsWhitelisted(whitelistStatus);
        setError(null);
      } catch (error) {
        console.error('Error checking whitelist status:', error);
        setError('Failed to check whitelist status. Please try again later.');
      }
    };

    checkWhitelist();
  }, [capicoContract, account]);

  if (error) {
    return <WhitelistWrapper>{error}</WhitelistWrapper>;
  }

  return (
    <WhitelistWrapper>
      <h3>Whitelist Status</h3>
      <p>
        Your address is {isWhitelisted ? 'whitelisted' : 'not whitelisted'} for this ICO.
      </p>
    </WhitelistWrapper>
  );
}
