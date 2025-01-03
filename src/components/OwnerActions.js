import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const OwnerActions = ({ onActionComplete }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [newWhitelistAddresses, setNewWhitelistAddresses] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkOwnerStatus();
  }, []);

  const checkOwnerStatus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        const owner = await contract.owner();
        const currentAddress = await signer.getAddress();
        setIsOwner(owner.toLowerCase() === currentAddress.toLowerCase());
      } catch (error) {
        console.error('Error checking owner status:', error);
      }
    }
  };

  const handleAction = async (action, ...args) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
      let tx;
      switch (action) {
        case 'toggleActive':
          tx = await contract.toggleActive();
          break;
        case 'updateWhitelist':
          tx = await contract.updateWhitelist(args[0], true);
          break;
        default:
          throw new Error('Invalid action');
      }
      await tx.wait();
      console.log(`${action} transaction completed:`, tx.hash);
      setSuccessMessage(`${action} completed successfully`);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setError(`Failed to perform ${action}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Owner Actions</h3>
      <div className="space-y-4">
        <button
          onClick={() => handleAction('toggleActive')}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Toggle ICO Status
        </button>
        <div>
          <input
            type="text"
            value={newWhitelistAddresses}
            onChange={(e) => setNewWhitelistAddresses(e.target.value)}
            placeholder="Enter addresses to whitelist (comma-separated)"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={() => handleAction('updateWhitelist', newWhitelistAddresses.split(',').map(addr => addr.trim()))}
            disabled={isLoading}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Update Whitelist
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
    </div>
  );
};

export default OwnerActions;

