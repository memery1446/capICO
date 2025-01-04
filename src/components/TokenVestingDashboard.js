import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { updateICOInfo } from '../store/icoSlice';

const TokenVestingDashboard = () => {
  const [vestingSchedule, setVestingSchedule] = useState(null);
  const [error, setError] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const tokenSymbol = useSelector((state) => state.ico.tokenSymbol);
  const dispatch = useDispatch();

  const fetchVestingSchedule = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        const address = await signer.getAddress();
        const schedule = await contract.vestingSchedules(address);
        
        setVestingSchedule({
          totalAmount: ethers.utils.formatEther(schedule.totalAmount),
          releasedAmount: ethers.utils.formatEther(schedule.releasedAmount),
          startTime: new Date(schedule.startTime.toNumber() * 1000),
          duration: schedule.duration.toNumber(),
          cliff: schedule.cliff.toNumber(),
        });
      } catch (error) {
        console.error('Error fetching vesting schedule:', error);
        setError('Failed to fetch vesting schedule. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    fetchVestingSchedule();
    const interval = setInterval(fetchVestingSchedule, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchVestingSchedule]);

  const calculateVestedPercentage = () => {
    if (!vestingSchedule) return 0;
    const now = Date.now();
    const elapsedTime = (now - vestingSchedule.startTime.getTime()) / 1000;
    return Math.min(100, (elapsedTime / vestingSchedule.duration) * 100);
  };

  const releaseTokens = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsReleasing(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        const tx = await contract.releaseVestedTokens();
        await tx.wait();
        
        // Refresh vesting schedule and ICO info
        fetchVestingSchedule();
        const address = await signer.getAddress();
        const balance = await contract.balanceOf(address);
        dispatch(updateICOInfo({ tokenBalance: ethers.utils.formatEther(balance) }));
      } catch (error) {
        console.error('Error releasing tokens:', error);
        setError('Failed to release tokens. Please try again.');
      } finally {
        setIsReleasing(false);
      }
    }
  }, [dispatch, fetchVestingSchedule]);

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!vestingSchedule) {
    return <div>Loading vesting schedule...</div>;
  }

  const vestedPercentage = calculateVestedPercentage();

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Token Vesting Dashboard</h2>
      <div style={{ marginBottom: '1rem' }}>
        <p>Total Vested Amount: {vestingSchedule.totalAmount} {tokenSymbol}</p>
        <p>Released Amount: {vestingSchedule.releasedAmount} {tokenSymbol}</p>
        <p>Vesting Start Date: {vestingSchedule.startTime.toLocaleDateString()}</p>
        <p>Vesting Duration: {vestingSchedule.duration / (24 * 60 * 60)} days</p>
        <p>Cliff Period: {vestingSchedule.cliff / (24 * 60 * 60)} days</p>
      </div>
      <div>
        <div style={{ backgroundColor: '#e5e7eb', height: '1rem', borderRadius: '0.25rem', overflow: 'hidden' }}>
          <div
            style={{
              width: `${vestedPercentage}%`,
              backgroundColor: '#3b82f6',
              height: '100%',
            }}
          />
        </div>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{vestedPercentage.toFixed(2)}% Vested</p>
      </div>
      <button 
        onClick={releaseTokens}
        disabled={isReleasing || vestedPercentage === 0}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
          marginTop: '1rem',
          opacity: isReleasing || vestedPercentage === 0 ? 0.5 : 1,
        }}
      >
        {isReleasing ? 'Releasing...' : 'Release Vested Tokens'}
      </button>
    </div>
  );
};

export default TokenVestingDashboard;

