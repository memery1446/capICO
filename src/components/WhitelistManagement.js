import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

const WhitelistWrapper = styled.div`
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

export default function WhitelistManagement({ capicoContract, account }) {
  const [addresses, setAddresses] = useState('');
  const [isAdding, setIsAdding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      if (capicoContract && account) {
        try {
          const owner = await capicoContract.owner();
          setIsOwner(owner.toLowerCase() === account.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
        }
      }
    };

    checkOwnership();
  }, [capicoContract, account]);

  const handleWhitelistUpdate = async () => {
    if (!capicoContract || !isOwner) {
      setError("You don't have permission to update the whitelist");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const addressList = addresses.split(',').map(addr => addr.trim());
      
      // Validate addresses
      addressList.forEach(addr => {
        if (!ethers.utils.isAddress(addr)) {
          throw new Error(`Invalid address: ${addr}`);
        }
      });

      const tx = await capicoContract.updateWhitelist(addressList, isAdding);
      await tx.wait();
      setAddresses('');
      alert(`Addresses ${isAdding ? 'added to' : 'removed from'} whitelist successfully!`);
    } catch (error) {
      console.error('Error updating whitelist:', error);
      setError(`Failed to ${isAdding ? 'add' : 'remove'} addresses ${isAdding ? 'to' : 'from'} whitelist. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    return null; // Don't render anything if not the owner
  }

  return (
    <WhitelistWrapper>
      <h3>Whitelist Management</h3>
      <Input
        type="text"
        placeholder="Enter addresses separated by commas"
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
      />
      <Button onClick={() => setIsAdding(true)} disabled={isLoading}>
        Set to Add
      </Button>
      <Button onClick={() => setIsAdding(false)} disabled={isLoading}>
        Set to Remove
      </Button>
      <Button onClick={handleWhitelistUpdate} disabled={isLoading || !addresses.trim()}>
        {isLoading ? 'Processing...' : `${isAdding ? 'Add' : 'Remove'} Addresses`}
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </WhitelistWrapper>
  );
}

