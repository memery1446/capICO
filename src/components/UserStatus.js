import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const UserStatus = () => {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
          
          const userAddress = await signer.getAddress();
          setAddress(userAddress);
          
          const whitelistStatus = await contract.whitelist(userAddress);
          setIsWhitelisted(whitelistStatus);
        } catch (err) {
          console.error('Error checking whitelist status:', err);
          setError('Failed to check whitelist status');
        }
      } else {
        setError('Please install MetaMask to use this feature');
      }
    };

    checkWhitelistStatus();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Your Status</h3>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <p><span className="font-semibold">Address:</span> {address}</p>
          <p><span className="font-semibold">Whitelist Status:</span> {isWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}</p>
        </>
      )}
    </div>
  );
};

export default UserStatus;

