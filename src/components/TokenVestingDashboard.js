import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { updateICOInfo } from '../store/icoSlice';

const TokenVestingDashboard = () => {
  const [vestingSchedule, setVestingSchedule] = useState(null);
  const [lockedTokens, setLockedTokens] = useState('0');
  const [error, setError] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const tokenSymbol = useSelector((state) => state.ico.tokenSymbol);
  const dispatch = useDispatch();

  const fetchVestingAndLockupInfo = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        const address = await signer.getAddress();
        const [schedule, locked] = await Promise.all([
          contract.vestingSchedules(address),
          contract.lockedTokens(address)
        ]);
        
        setVestingSchedule({
          totalAmount: ethers.utils.formatEther(schedule.totalAmount),
          releasedAmount: ethers.utils.formatEther(schedule.releasedAmount),
          startTime: new Date(schedule.startTime.toNumber() * 1000),
          duration: schedule.duration.toNumber(),
          cliff: schedule.cliff.toNumber(),
        });

        setLockedTokens(ethers.utils.formatEther(locked));
      } catch (error) {
        console.error('Error fetching vesting and lockup info:', error);
        setError('Failed to fetch vesting and lockup information. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    fetchVestingAndLockupInfo();
    const interval = setInterval(fetchVestingAndLockupInfo, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchVestingAndLockupInfo]);

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
        
        fetchVestingAndLockupInfo();
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
  }, [dispatch, fetchVestingAndLockupInfo]);

  const unlockTokens = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsUnlocking(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        const tx = await contract.unlockTokens();
        await tx.wait();
        
        fetchVestingAndLockupInfo();
        const address = await signer.getAddress();
        const balance = await contract.balanceOf(address);
        dispatch(updateICOInfo({ tokenBalance: ethers.utils.formatEther(balance) }));
      } catch (error) {
        console.error('Error unlocking tokens:', error);
        setError('Failed to unlock tokens. The lockup period may not be over yet.');
      } finally {
        setIsUnlocking(false);
      }
    }
  }, [dispatch, fetchVestingAndLockupInfo]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!vestingSchedule) {
    return <div>Loading vesting and lockup information...</div>;
  }

  const vestedPercentage = calculateVestedPercentage();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Token Vesting and Lockup Dashboard</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Vesting Schedule</h3>
        <p>Total Vested Amount: {vestingSchedule.totalAmount} {tokenSymbol}</p>
        <p>Released Amount: {vestingSchedule.releasedAmount} {tokenSymbol}</p>
        <p>Vesting Start Date: {vestingSchedule.startTime.toLocaleDateString()}</p>
        <p>Vesting Duration: {vestingSchedule.duration / (24 * 60 * 60)} days</p>
        <p>Cliff Period: {vestingSchedule.cliff / (24 * 60 * 60)} days</p>
      </div>
      <div className="mb-4">
        <div className="bg-gray-200 h-4 rounded-full">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${vestedPercentage}%` }}
          />
        </div>
        <p className="text-center mt-2">{vestedPercentage.toFixed(2)}% Vested</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Locked Tokens</h3>
        <p>Locked Amount: {lockedTokens} {tokenSymbol}</p>
      </div>
      <div className="flex space-x-4">
        <button 
          onClick={releaseTokens}
          disabled={isReleasing || vestedPercentage === 0}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isReleasing ? 'Releasing...' : 'Release Vested Tokens'}
        </button>
        <button 
          onClick={unlockTokens}
          disabled={isUnlocking || lockedTokens === '0'}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isUnlocking ? 'Unlocking...' : 'Unlock Tokens'}
        </button>
      </div>
    </div>
  );
};

export default TokenVestingDashboard;

