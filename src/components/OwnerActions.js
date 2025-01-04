import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const OwnerActions = () => {
  const [isActive, setIsActive] = useState(true);
  const [isCooldownEnabled, setIsCooldownEnabled] = useState(false);
  const [isVestingEnabled, setIsVestingEnabled] = useState(true);
  const [whitelistAddresses, setWhitelistAddresses] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchContractState = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
        
        const [active, cooldownEnabled, vestingEnabled] = await Promise.all([
          contract.isActive(),
          contract.cooldownEnabled(),
          contract.vestingEnabled()
        ]);

        setIsActive(active);
        setIsCooldownEnabled(cooldownEnabled);
        setIsVestingEnabled(vestingEnabled);
      } catch (error) {
        console.error('Error fetching contract state:', error);
        setError('Failed to fetch contract state. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    fetchContractState();
  }, [fetchContractState]);

  const handleToggle = async (action) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

        let tx;
        switch (action) {
          case 'toggleActive':
            tx = await contract.toggleActive();
            break;
          case 'toggleCooldown':
            tx = await contract.toggleCooldown();
            break;
          case 'toggleVesting':
            tx = await contract.toggleVesting();
            break;
          default:
            throw new Error('Invalid action');
        }

        await tx.wait();
        setSuccessMessage(`${action} completed successfully`);
        await fetchContractState(); // Refresh the contract state
      } catch (error) {
        console.error(`Error ${action}:`, error);
        setError(`Failed to ${action}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleWhitelist = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

        const addresses = whitelistAddresses.split(',').map(addr => addr.trim());
        const tx = await contract.whitelistAddresses(addresses);
        await tx.wait();

        setSuccessMessage('Addresses whitelisted successfully');
        setWhitelistAddresses('');
      } catch (error) {
        console.error('Error whitelisting addresses:', error);
        setError('Failed to whitelist addresses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Owner Actions</h2>
      <div className="space-y-4">
        <button
          onClick={() => handleToggle('toggleActive')}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {isActive ? 'Pause ICO' : 'Activate ICO'}
        </button>
        <button
          onClick={() => handleToggle('toggleCooldown')}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${isCooldownEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {isCooldownEnabled ? 'Disable Cooldown' : 'Enable Cooldown'}
        </button>
        <button
          onClick={() => handleToggle('toggleVesting')}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${isVestingEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {isVestingEnabled ? 'Disable Vesting' : 'Enable Vesting'}
        </button>
      </div>
      <form onSubmit={handleWhitelist} className="mt-4">
        <input
          type="text"
          value={whitelistAddresses}
          onChange={(e) => setWhitelistAddresses(e.target.value)}
          placeholder="Enter addresses to whitelist (comma-separated)"
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Whitelist Addresses
        </button>
      </form>
      {isLoading && <p className="mt-4 text-blue-500">Processing transaction...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}
    </div>
  );
};

export default OwnerActions;

