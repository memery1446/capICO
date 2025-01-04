import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { setWhitelistStatus } from '../store/icoSlice';

const WhitelistStatus = () => {
  const dispatch = useDispatch();
  const isWhitelisted = useSelector((state) => state.ico.isWhitelisted);

  const checkWhitelistStatus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);

        const address = await signer.getAddress();
        const status = await contract.whitelist(address);
        dispatch(setWhitelistStatus(status));
      } catch (error) {
        console.error('Error checking whitelist status:', error);
      }
    }
  };

  useEffect(() => {
    checkWhitelistStatus();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Whitelist Status</h3>
      <p>You are {isWhitelisted ? '' : 'not'} whitelisted for this ICO.</p>
    </div>
  );
};

export default WhitelistStatus;

