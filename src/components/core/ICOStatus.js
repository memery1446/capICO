import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, TrendingUp, Users, Coins, BarChart } from 'lucide-react';

const ICOStatus = () => {
  const { 
    status,
    tokenPrice,
    softCap,
    hardCap,
    totalRaised,
    totalTokensSold,
    minInvestment,
    maxInvestment
  } = useSelector(state => state.ico);

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

useEffect(() => {
  console.log('ICOStatus - Initial remainingTime:', status?.remainingTime);
  
  const timer = setInterval(() => {
    if (!status?.remainingTime) {
      console.log('ICOStatus - No remaining time');
      return;
    }
    
    const remainingSeconds = parseInt(status?.remainingTime);
    console.log('ICOStatus - Parsed seconds:', remainingSeconds);
    
    setTimeRemaining({
      days: Math.floor(remainingSeconds / 86400),
      hours: Math.floor((remainingSeconds % 86400) / 3600),
      minutes: Math.floor((remainingSeconds % 3600) / 60),
      seconds: remainingSeconds % 60
    });
  }, 1000);

  return () => clearInterval(timer);
}, [status?.remainingTime]);

  const progressPercentage = (parseFloat(totalRaised) / parseFloat(hardCap)) * 100;
  const tokensSoldPercentage = (parseFloat(totalTokensSold) / parseFloat(hardCap)) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">ICO Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Time Remaining</p>
              <p className="font-semibold">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Token Price</p>
              <p className="font-semibold">{tokenPrice} ETH</p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Total Raised</p>
              <p className="font-semibold">{totalRaised} ETH</p>
            </div>
          </div>
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Tokens Sold</p>
              <p className="font-semibold">{totalTokensSold}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Funding Progress</h3>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>{totalRaised} ETH</span>
          <span>{hardCap} ETH</span>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Soft Cap: {softCap} ETH</span>
          <span>Hard Cap: {hardCap} ETH</span>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Token Distribution</h3>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500" 
            style={{ width: `${tokensSoldPercentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>Tokens Sold: {totalTokensSold}</span>
          <span>{tokensSoldPercentage.toFixed(2)}%</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Min Investment</p>
            <p className="font-semibold">{minInvestment} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Investment</p>
            <p className="font-semibold">{maxInvestment} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICOStatus;

