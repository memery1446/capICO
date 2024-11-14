import React, { useState } from 'react';
import styled from 'styled-components';

const WhitelistManagementWrapper = styled.div`
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
`;

export default function WhitelistManagement({ capicoContract, account }) {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState('');

  const handleWhitelist = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!ethers.utils.isAddress(address)) {
      setMessage('Invalid address');
      return;
    }

    try {
      const tx = await capicoContract.updateWhitelist([address], status);
      await tx.wait();
      setMessage(`Address ${address} has been ${status ? 'whitelisted' : 'removed from whitelist'}`);
      setAddress('');
    } catch (error) {
      console.error('Error updating whitelist:', error);
      setMessage('Failed to update whitelist. Make sure you are the contract owner.');
    }
  };

  return (
    <WhitelistManagementWrapper>
      <h3>Manage Whitelist</h3>
      <form onSubmit={handleWhitelist}>
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address to whitelist/unwhitelist"
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            Whitelist Status
          </label>
        </div>
        <Button type="submit">Update Whitelist</Button>
      </form>
      {message && <p>{message}</p>}
    </WhitelistManagementWrapper>
  );
}

