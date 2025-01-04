import React from 'react';
import { useSelector } from 'react-redux';

const VestingInfo = () => {
  const vestingSchedule = useSelector((state) => state.ico.vestingSchedule);

  if (!vestingSchedule) {
    return <div>No vesting schedule available.</div>;
  }

  const now = Math.floor(Date.now() / 1000);
  const vestedPercentage = Math.min(
    100,
    ((now - vestingSchedule.startTime) / vestingSchedule.duration) * 100
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Vesting Schedule</h3>
      <p>Total Amount: {vestingSchedule.totalAmount} tokens</p>
      <p>Released Amount: {vestingSchedule.releasedAmount} tokens</p>
      <p>Start Time: {new Date(vestingSchedule.startTime * 1000).toLocaleString()}</p>
      <p>Duration: {vestingSchedule.duration / (24 * 60 * 60)} days</p>
      <p>Cliff: {vestingSchedule.cliff / (24 * 60 * 60)} days</p>
      <div className="mt-4">
        <div className="bg-gray-200 h-4 rounded-full">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${vestedPercentage}%` }}
          ></div>
        </div>
        <p className="text-center mt-2">{vestedPercentage.toFixed(2)}% Vested</p>
      </div>
    </div>
  );
};

export default VestingInfo;

