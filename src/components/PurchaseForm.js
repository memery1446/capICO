import React, { useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

const PurchaseFormWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
`;

export default function PurchaseForm({ capicoContract, account }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const amountInWei = ethers.utils.parseEther(amount);
      const tx = await capicoContract.buyTokens(amountInWei, { value: amountInWei });
      await tx.wait();
      setSuccess(`Successfully purchased ${amount} tokens!`);
      setAmount('');
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError('Failed to purchase tokens. Please try again.');
    }
  };

  return (
    <PurchaseFormWrapper>
      <h3>Purchase Tokens</h3>
      <form onSubmit={handlePurchase}>
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount of tokens to purchase"
        />
        <Button type="submit">Purchase</Button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </PurchaseFormWrapper>
  );
}
