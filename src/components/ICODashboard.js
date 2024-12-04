import React from 'react';
import { useSelector } from 'react-redux';
import { Timer, TrendingUp, Wallet, Target } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, subtext = null }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value, max, label }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{label}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{value} ETH</span>
        <span>{max} ETH</span>
      </div>
    </div>
  );
};

const TimeDisplay = ({ startTime, endTime }) => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTime - now;
  
  if (remaining <= 0) return null;
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remaining % (60 * 60)) / 60);

  return (
    <div className="grid grid-cols-3 gap-4 bg-blue-50 p-6 rounded-lg">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{days}</div>
        <div className="text-sm text-gray-600">Days</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{hours}</div>
        <div className="text-sm text-gray-600">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{minutes}</div>
        <div className="text-sm text-gray-600">Minutes</div>
      </div>
    </div>
  );
};

const ICODashboard = () => {
  const { 
    status, tokenPrice, softCap, hardCap, 
    totalRaised, totalTokensSold 
  } = useSelector(state => state.ico);
  
  const formatEth = (value) => parseFloat(value).toFixed(2);
  const formatTokens = (value) => parseInt(value).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ICO Status</h2>
          <p className="text-gray-500 mt-1">Real-time campaign metrics</p>
        </div>
        <div className={`px-4 py-2 rounded-full ${
          status.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Countdown Timer */}
      {status.isActive && (
        <TimeDisplay 
          startTime={status.startTime} 
          endTime={status.endTime}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Token Price" 
          value={`${formatEth(tokenPrice)} ETH`}
          icon={Wallet}
        />
        <StatCard 
          title="Total Raised" 
          value={`${formatEth(totalRaised)} ETH`}
          subtext={`${((totalRaised / hardCap) * 100).toFixed(1)}% of Hard Cap`}
          icon={TrendingUp}
        />
        <StatCard 
          title="Tokens Sold" 
          value={formatTokens(totalTokensSold)}
          icon={Target}
        />
        <StatCard 
          title="Time Remaining" 
          value={status.remainingTime > 0 
            ? `${Math.floor(status.remainingTime / 3600)}h` 
            : 'Ended'
          }
          icon={Timer}
        />
      </div>

      {/* Progress Bars */}
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4">Fundraising Progress</h3>
        <div className="space-y-6">
          <ProgressBar 
            value={totalRaised} 
            max={hardCap} 
            label="Hard Cap Progress" 
          />
          <ProgressBar 
            value={totalRaised} 
            max={softCap} 
            label="Soft Cap Progress" 
          />
        </div>
      </div>
    </div>
  );
};

export default ICODashboard;