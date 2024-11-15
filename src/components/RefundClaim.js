import React, { useState } from 'react';
import styled from 'styled-components';

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

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-weight: bold;
`;

export default function RefundClaim({ capicoContract, account }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClaimRefund = async () => {
    if (!capicoContract || !account) return;

    try {
      setIsLoading(true);
      setError(null);
      const tx = await capicoContract.claimRefund();
      await tx.wait();
      alert('Refund claimed successfully!');
    } catch (error) {
      console.error('Error claiming refund:', error);
      setError(`Failed to claim refund: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleClaimRefund} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Claim Refund'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

