import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReferralBonus, setCurrentReferrer } from '../store/referralSlice';

const SUPPORTED_NETWORKS = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  31337: 'Hardhat Network',
  1337: 'Local Ganache',
};

const ReferralSystem = ({ ethersService }) => {
  const [newReferrer, setNewReferrer] = useState('');
  const [error, setError] = useState('');
  const [networkName, setNetworkName] = useState('');
  const dispatch = useDispatch();
  const { isWalletConnected, referralBonus, currentReferrer } = useSelector((state) => state.referral);
  const { tokenSymbol } = useSelector((state) => state.ico);

  const fetchReferralInfo = async () => {
    if (isWalletConnected) {
      try {
        const network = await ethersService.getNetwork();
        if (!SUPPORTED_NETWORKS[network.chainId]) {
          throw new Error(`Unsupported network (chainId: ${network.chainId}). Please switch to a supported network.`);
        }
        setNetworkName(SUPPORTED_NETWORKS[network.chainId]);

        const [bonus, referrer] = await Promise.all([
          ethersService.getReferralBonus(),
          ethersService.getCurrentReferrer()
        ]);

        dispatch(setReferralBonus(bonus));
        dispatch(setCurrentReferrer(referrer));
        setError('');
      } catch (error) {
        console.error('Error fetching referral info:', error);
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    fetchReferralInfo();
  }, [isWalletConnected]);

  const handleSetReferrer = async () => {
    if (isWalletConnected) {
      try {
        await ethersService.setReferrer(newReferrer);
        await fetchReferralInfo();
        setNewReferrer('');
        setError('');
      } catch (error) {
        //console.error('Error setting referrer:', error); 
        //supressed to clean terminal comment in to see correct error
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
        <p className="font-semibold">Network: {networkName}</p>
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

