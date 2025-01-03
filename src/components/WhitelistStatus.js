import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const WhitelistStatus = () => {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [error, setError] = useState(null);

  const checkWhitelistStatus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);

        const address = await signer.getAddress();
        const status = await contract.whitelist(address);
        setIsWhitelisted(status);
      } catch (error) {
        console.error('Error checking whitelist status:', error);
        setError('Failed to check whitelist status. Please try again.');
      }
    } else {
      setError('MetaMask is not installed. Please install it to interact with this dApp.');
    }
  };

  useEffect(() => {
    checkWhitelistStatus();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Whitelist Status</h3>
      <p>You are {isWhitelisted ? '' : 'not'} whitelisted for this ICO.</p>
    </div>
  );
};

export default WhitelistStatus;

