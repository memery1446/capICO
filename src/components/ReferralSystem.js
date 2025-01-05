import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { setReferralBonus, setCurrentReferrer } from '../store/referralSlice';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const ReferralSystem = () => {
  const [newReferrer, setNewReferrer] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { isWalletConnected, referralBonus, currentReferrer } = useSelector((state) => state.referral);
  const { tokenSymbol } = useSelector((state) => state.ico);

  const fetchReferralInfo = async () => {
    if (typeof window.ethereum !== 'undefined' && isWalletConnected) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check if the network is supported
        const network = await provider.getNetwork();
        if (network.chainId !== 1) { // Assuming we're using Ethereum mainnet
          throw new Error('Unsupported network. Please switch to Ethereum mainnet.');
        }

        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
    
        const address = await signer.getAddress();
        const bonus = await contract.referralBonuses(address);
        const referrer = await contract.referrers(address);
    
        dispatch(setReferralBonus(ethers.utils.formatEther(bonus)));
        dispatch(setCurrentReferrer(referrer !== ethers.constants.AddressZero ? referrer : ''));
        setError('');
      } catch (error) {
        console.error('Error fetching referral info:', error);
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      fetchReferralInfo();
    }
  }, [isWalletConnected]);

  const handleSetReferrer = async () => {
    if (typeof window.ethereum !== 'undefined' && isWalletConnected) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        await contract.setReferrer(newReferrer);
        await fetchReferralInfo();
        setNewReferrer('');
        setError('');
      } catch (error) {
        console.error('Error setting referrer:', error);
        setError(error.message);
      }
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Referral System</h2>
        <p>Please connect your wallet to view and interact with the referral system.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Referral System</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <p className="font-semibold">Your Referral Bonus: {referralBonus} {tokenSymbol}</p>
      </div>
      <div className="mb-4">
        <p className="font-semibold">Current Referrer: {currentReferrer || 'Not set'}</p>
        <div className="flex mt-2">
          <input
            type="text"
            value={newReferrer}
            onChange={(e) => setNewReferrer(e.target.value)}
            placeholder="Enter referrer address"
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={handleSetReferrer}
            disabled={!newReferrer}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r disabled:opacity-50"
          >
            Set Referrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;

