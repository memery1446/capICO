import React from 'react';
import { useSelector } from 'react-redux';
import { Coins, Users, Clock, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
  const { 
    tokenPrice, 
    softCap, 
    hardCap, 
    totalRaised, 
    totalTokensSold,
    status
  } = useSelector(state => state.ico);

  const progressPercentage = (parseFloat(totalRaised) / parseFloat(hardCap)) * 100;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const timeRemaining = () => {
    const remaining = parseInt(status?.remainingTime) * 1000 - Date.now();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Total Raised</h3>
          <Coins className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{formatNumber(totalRaised)} ETH</div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {formatNumber(progressPercentage)}% of {formatNumber(hardCap)} ETH goal
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Tokens Sold</h3>
          <Users className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{formatNumber(totalTokensSold)}</div>
        <p className="text-xs text-gray-500 mt-2">
          Token Price: {tokenPrice} ETH
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Time Remaining</h3>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{timeRemaining()}</div>
        <p className="text-xs text-gray-500 mt-2">
          {status?.isActive ? 'ICO is active' : 'ICO is not active'}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Soft Cap</h3>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{formatNumber(softCap)} ETH</div>
        <p className="text-xs text-gray-500 mt-2">
          {parseFloat(totalRaised) >= parseFloat(softCap) ? 'Soft cap reached' : 'Soft cap not reached'}
        </p>
      </div>
    </div>
  );
};

export default DashboardOverview;

