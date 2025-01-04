import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { updateICOInfo } from '../store/icoSlice';

const ReferralSystem = () => {
  const [referralBonus, setReferralBonus] = useState('0');
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [error, setError] = useState('');
  const tokenSymbol = useSelector((state) => state.ico.tokenSymbol);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchReferralBonus = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
          const address = await signer.getAddress();
          
          const bonus = await contract.referralBonuses(address);
          setReferralBonus(ethers.utils.formatEther(bonus));
        } catch (error) {
          console.error('Error fetching referral bonus:', error);
          setError('Failed to fetch referral bonus. Please try again.');
        }
      }
    };

    fetchReferralBonus();
    const interval = setInterval(fetchReferralBonus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const claimReferralBonus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsClaimingBonus(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        const tx = await contract.claimReferralBonus();
        await tx.wait();
        
        setReferralBonus('0');
        dispatch(updateICOInfo({ tokenBalance: (await contract.balanceOf(await signer.getAddress())).toString() }));
      } catch (error) {
        console.error('Error claiming referral bonus:', error);
        setError('Failed to claim referral bonus. Please try again.');
      } finally {
        setIsClaimingBonus(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Referral System</h2>
      <p className="mb-4">Your Referral Bonus: {referralBonus} {tokenSymbol}</p>
      <button 
        onClick={claimReferralBonus}
        disabled={isClaimingBonus || referralBonus === '0'}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isClaimingBonus ? 'Claiming...' : 'Claim Referral Bonus'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ReferralSystem;



