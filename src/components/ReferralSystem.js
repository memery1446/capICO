import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const ReferralSystem = () => {
  const [referrer, setReferrer] = useState('');
  const [newReferrer, setNewReferrer] = useState('');
  const [referralBonus, setReferralBonus] = useState('0');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
        const address = await signer.getAddress();

        const currentReferrer = await contract.referrers(address);
        setReferrer(currentReferrer !== ethers.constants.AddressZero ? currentReferrer : '');

        const bonus = await contract.referralBonuses(address);
        setReferralBonus(ethers.utils.formatEther(bonus));
      } catch (error) {
        console.error('Error fetching referral info:', error);
      }
    }
  };

  const setReferrerAddress = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

        const tx = await contract.setReferrer(newReferrer);
        await tx.wait();

        setSuccessMessage('Referrer set successfully');
        setNewReferrer('');
        fetchReferralInfo();
      } catch (error) {
        console.error('Error setting referrer:', error);
        setError('Failed to set referrer. Please try again.');
      }
    }
  };

  const claimReferralBonus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

        const tx = await contract.claimReferralBonus();
        await tx.wait();

        setSuccessMessage('Referral bonus claimed successfully');
        fetchReferralInfo();
      } catch (error) {
        console.error('Error claiming referral bonus:', error);
        setError('Failed to claim referral bonus. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Referral System</h2>
      <div className="mb-4">
        <p><strong>Your Referrer:</strong> {referrer || 'Not set'}</p>
        <p><strong>Your Referral Bonus:</strong> {referralBonus} DEMO</p>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={newReferrer}
          onChange={(e) => setNewReferrer(e.target.value)}
          placeholder="Enter referrer address"
          className="form-control mb-2"
        />
        <button onClick={setReferrerAddress} className="btn btn-primary">
          Set Referrer
        </button>
      </div>
      <div>
        <button onClick={claimReferralBonus} className="btn btn-success" disabled={referralBonus === '0'}>
          Claim Referral Bonus
        </button>
      </div>
      {error && <p className="text-danger mt-2">{error}</p>}
      {successMessage && <p className="text-success mt-2">{successMessage}</p>}
    </div>
  );
};

export default ReferralSystem;


