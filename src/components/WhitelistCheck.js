import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WhitelistCheckWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

export default function WhitelistCheck({ capicoContract, account }) {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (!capicoContract || !account) return;

      try {
        const status = await capicoContract.whitelist(account);
        setIsWhitelisted(status);
        setError(null);
      } catch (error) {
        console.error("Error checking whitelist status:", error);
        setError("Failed to check whitelist status. Please try again later.");
      }
    };

    checkWhitelistStatus();
  }, [capicoContract, account]);

  if (error) {
    return <WhitelistCheckWrapper>{error}</WhitelistCheckWrapper>;
  }

  return (
    <WhitelistCheckWrapper>
      <h3>Whitelist Status</h3>
      <p>
        {isWhitelisted
          ? "You are whitelisted for the CapICO crowdsale."
          : "You are not whitelisted for the CapICO crowdsale."}
      </p>
    </WhitelistCheckWrapper>
  );
}

