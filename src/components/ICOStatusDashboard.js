import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Timer, 
  TrendingUp, 
  Users, 
  CircleDollarSign,
  Wallet,
  Target
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, className = '' }) => (
  <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
        {change && (
          <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value, max, label }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{(value / max * 100).toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${(value / max * 100)}%` }}
      />
    </div>
  </div>
);

const ICOStatusDashboard = () => {
  const { 
    tokenPrice, 
    softCap, 
    hardCap, 
    totalRaised,
    totalTokensSold,
    status
  } = useSelector(state => state.ico);

  const { balance } = useSelector(state => state.account);

  // Calculate time remaining if ICO is active
  const timeRemaining = status.remainingTime ? {
    days: Math.floor(status.remainingTime / (24 * 60 * 60)),
    hours: Math.floor((status.remainingTime % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((status.remainingTime % (60 * 60)) / 60)
  } : null;

  const getStatusColor = () => {
    if (!status.hasStarted) return 'text-yellow-600';
    if (status.hasEnded) return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (!status.hasStarted) return 'Starting Soon';
    if (status.hasEnded) return 'Ended';
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ICO Status</h2>
          <p className="text-gray-500">Real-time ICO performance metrics</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor()} bg-opacity-10`}>
          {getStatusText()}
        </div>
      </div>

      {/* Time Remaining */}
      {timeRemaining && status.isActive && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <Timer className="w-5 h-5 text-blue-600" />
            <div className="flex space-x-4">
              <div>
                <span className="text-2xl font-bold">{timeRemaining.days}</span>
                <span className="text-sm text-gray-600 ml-1">days</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{timeRemaining.hours}</span>
                <span className="text-sm text-gray-600 ml-1">hours</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{timeRemaining.minutes}</span>
                <span className="text-sm text-gray-600 ml-1">min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Token Price" 
          value={`${tokenPrice} ETH`}
          icon={CircleDollarSign}
        />
        <StatCard 
          title="Total Raised" 
          value={`${totalRaised} ETH`}
          icon={TrendingUp}
          change={2.5}
        />
        <StatCard 
          title="Tokens Sold" 
          value={totalTokensSold}
          icon={Wallet}
        />
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Fundraising Progress</h3>
        <ProgressBar 
          value={parseFloat(totalRaised)} 
          max={parseFloat(hardCap)}
          label="Hard Cap Progress"
        />
        <ProgressBar 
          value={parseFloat(totalRaised)} 
          max={parseFloat(softCap)}
          label="Soft Cap Progress"
        />
      </div>

      {/* Action Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to Participate?</h3>
            <p className="text-blue-100 mb-4">Current balance: {balance} ETH</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Buy Tokens
            </button>
          </div>
          <div className="bg-blue-400 bg-opacity-30 p-4 rounded-lg">
            <Target className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICOStatusDashboard;

