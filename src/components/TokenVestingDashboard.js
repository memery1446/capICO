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
  const [cliffCountdown, setCliffCountdown] = useState('');
  const [lockupCountdown, setLockupCountdown] = useState('');
  const tokenSymbol = useSelector((state) => state.ico.tokenSymbol);
  const dispatch = useDispatch();

  const fetchVestingAndLockupInfo = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
        
        const address = await signer.getAddress();
        const [schedule, locked, icoStartTime] = await Promise.all([
          contract.vestingSchedules(address),
          contract.lockedTokens(address),
          contract.icoStartTime()
        ]);
        
        setVestingSchedule({
          totalAmount: ethers.utils.formatEther(schedule.totalAmount),
          releasedAmount: ethers.utils.formatEther(schedule.releasedAmount),
          startTime: new Date(schedule.startTime.toNumber() * 1000),
          duration: schedule.duration.toNumber(),
          cliff: schedule.cliff.toNumber(),
        });

        setLockedTokens(ethers.utils.formatEther(locked));

        const now = Math.floor(Date.now() / 1000);
        const cliffEnd = icoStartTime.toNumber() + schedule.cliff.toNumber();
        const lockupEnd = icoStartTime.toNumber() + 180 * 24 * 60 * 60;

        if (now < cliffEnd) {
          setCliffCountdown(formatCountdown(cliffEnd - now));
        } else {
          setCliffCountdown('Cliff period ended');
        }

        if (now < lockupEnd) {
          setLockupCountdown(formatCountdown(lockupEnd - now));
        } else {
          setLockupCountdown('Lockup period ended');
        }

      } catch (error) {
        console.error('Error fetching vesting and lockup info:', error);
        setError('Failed to fetch vesting and lockup information. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    fetchVestingAndLockupInfo();
    const interval = setInterval(fetchVestingAndLockupInfo, 30000);
    return () => clearInterval(interval);
  }, [fetchVestingAndLockupInfo]);

  const formatCountdown = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const calculateVestedPercentage = () => {
    if (!vestingSchedule) return 0;
    const now = Date.now();
    const elapsedTime = (now - vestingSchedule.startTime.getTime()) / 1000;
    return Math.min(100, (elapsedTime / vestingSchedule.duration) * 100);
  };

  // Token management functions
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
        dispatch(updateICOInfo({ tokenBalance: (await contract.balanceOf(await signer.getAddress())).toString() }));
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
        dispatch(updateICOInfo({ tokenBalance: (await contract.balanceOf(await signer.getAddress())).toString() }));
      } catch (error) {
        console.error('Error unlocking tokens:', error);
        setError('Failed to unlock tokens. The lockup period may not be over yet.');
      } finally {
        setIsUnlocking(false);
      }
    }
  }, [dispatch, fetchVestingAndLockupInfo]);

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-500 p-4 rounded-md bg-red-50">{error}</div>
      </div>
    );
  }

  if (!vestingSchedule || vestingSchedule.totalAmount === '0') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Active Vesting Schedule</h2>
          <p className="text-gray-500">You don't have any tokens currently in vesting.</p>
        </div>
      </div>
    );
  }

  const vestedPercentage = calculateVestedPercentage();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Token Vesting Dashboard</h2>
        <div className="text-sm text-gray-500">
          Auto-updates every 30s
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mb-2 flex justify-between text-sm text-gray-600">
          <span>Vesting Progress</span>
          <span>{vestedPercentage.toFixed(2)}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${vestedPercentage}%` }}
          />
        </div>
      </div>

  {/* Token Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Vesting Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Total Amount:</span>
              <span className="font-medium text-right break-all max-w-[60%]">{vestingSchedule.totalAmount} {tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Released Amount:</span>
              <span className="font-medium text-right break-all max-w-[60%]">{vestingSchedule.releasedAmount} {tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Start Date:</span>
              <span className="font-medium text-right">{vestingSchedule.startTime.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Time Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Vesting Duration:</span>
              <span className="font-medium text-right">{vestingSchedule.duration / (24 * 60 * 60)} days</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Cliff Period:</span>
              <span className="font-medium text-right">{vestingSchedule.cliff / (24 * 60 * 60)} days</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Cliff Status:</span>
              <span className={`font-medium text-right ${cliffCountdown === 'Cliff period ended' ? 'text-green-600' : 'text-yellow-600'}`}>
                {cliffCountdown}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Tokens Section */}
      {lockedTokens !== '0' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Locked Tokens</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Locked Amount:</span>
              <span className="font-medium text-right break-all max-w-[60%]">{lockedTokens} {tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-600 whitespace-nowrap">Lockup Status:</span>
              <span className={`font-medium text-right ${lockupCountdown === 'Lockup period ended' ? 'text-green-600' : 'text-yellow-600'}`}>
                {lockupCountdown}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={releaseTokens}
          disabled={isReleasing || vestedPercentage === 0}
          className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {isReleasing ? 'Releasing...' : 'Release Vested Tokens'}
        </button>
        {lockedTokens !== '0' && (
          <button 
            onClick={unlockTokens}
            disabled={isUnlocking || lockupCountdown !== 'Lockup period ended'}
            className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock Tokens'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenVestingDashboard;

