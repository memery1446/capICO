import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Coins, Users, Clock, TrendingUp } from 'lucide-react';
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import ReactApexChart from 'react-apexcharts';

const DashboardOverview = () => {
  const { 
    tokenPrice, 
    softCap, 
    hardCap, 
    totalRaised, 
    totalTokensSold,
    status
  } = useSelector(state => state.ico);

  const progressPercentage = useMemo(() => 
    (parseFloat(totalRaised) / parseFloat(hardCap)) * 100,
  [totalRaised, hardCap]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

const timeRemaining = useMemo(() => {
    if (!status?.remainingTime) return "0d 0h 0m 0s";
    const remainingSeconds = parseInt(status?.remainingTime);
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}, [status?.remainingTime]);

  const chartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Raised', 'Remaining'],
    colors: ['#4F46E5', '#E5E7EB'],
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const chartSeries = [parseFloat(totalRaised), parseFloat(hardCap) - parseFloat(totalRaised)];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Total Raised</h3>
          <Coins className="h-5 w-5 text-blue-500" />
        </div>
        <div className="text-2xl font-bold">{formatNumber(totalRaised)} ETH</div>
        <Progress value={progressPercentage} max={100} className="mt-2" />
        <p className="text-xs text-gray-500 mt-2">
          {formatNumber(progressPercentage)}% of {formatNumber(hardCap)} ETH goal
        </p>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Tokens Sold</h3>
          <Users className="h-5 w-5 text-green-500" />
        </div>
        <div className="text-2xl font-bold">{formatNumber(totalTokensSold)}</div>
        <p className="text-xs text-gray-500 mt-2">
          Token Price: {tokenPrice} ETH
        </p>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Time Remaining</h3>
          <Clock className="h-5 w-5 text-purple-500" />
        </div>
        <div className="text-2xl font-bold">{timeRemaining}</div>
        <p className="text-xs text-gray-500 mt-2">
          {status?.isActive ? 'ICO is active' : 'ICO is not active'}
        </p>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Soft Cap</h3>
          <TrendingUp className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="text-2xl font-bold">{formatNumber(softCap)} ETH</div>
        <p className="text-xs text-gray-500 mt-2">
          {parseFloat(totalRaised) >= parseFloat(softCap) ? 'Soft cap reached' : 'Soft cap not reached'}
        </p>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4 p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Fundraising Progress</h3>
        <ReactApexChart options={chartOptions} series={chartSeries} type="donut" height={350} />
      </Card>
    </div>
  );
};

export default DashboardOverview;

