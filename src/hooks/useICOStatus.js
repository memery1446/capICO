// hooks/useICOStatus.js
import { useState, useEffect, useMemo } from 'react';

export const useICOStatus = (contract) => {
  const [status, setStatus] = useState({
    startTime: 0,
    endTime: 0,
    isFinalized: false,
    totalRaised: '0',
    totalTokensSold: '0'
  });

  const [localTime, setLocalTime] = useState(0);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [
          startTime,
          endTime,
          isFinalized,
          totalRaised,
          totalTokensSold
        ] = await Promise.all([
          contract.startTime(),
          contract.endTime(),
          contract.isFinalized(),
          contract.totalRaised(),
          contract.totalTokensSold()
        ]);

        setStatus({
          startTime: startTime.toNumber(),
          endTime: endTime.toNumber(),
          isFinalized,
          totalRaised: ethers.utils.formatEther(totalRaised),
          totalTokensSold: ethers.utils.formatEther(totalTokensSold)
        });
      } catch (error) {
        console.error('Error loading ICO status:', error);
      }
    };

    if (contract) {
      loadStatus();
      const interval = setInterval(loadStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [contract]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const remainingTime = status.endTime > now ? status.endTime - now : 0;
    setLocalTime(remainingTime);

    const timer = setInterval(() => {
      setLocalTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [status.endTime]);

  const timeDisplay = useMemo(() => {
    const days = Math.floor(localTime / 86400);
    const hours = Math.floor((localTime % 86400) / 3600);
    const minutes = Math.floor((localTime % 3600) / 60);
    const seconds = localTime % 60;
    
    return {
      days,
      hours,
      minutes,
      seconds,
      formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
    };
  }, [localTime]);

  const icoState = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return {
      hasStarted: now >= status.startTime,
      hasEnded: now > status.endTime,
      isActive: now >= status.startTime && now <= status.endTime && !status.isFinalized
    };
  }, [status]);

  return {
    ...status,
    ...icoState,
    timeRemaining: timeDisplay,
    remainingTime: localTime
  };
};

