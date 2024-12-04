import React from 'react';
import { useSelector } from 'react-redux';

const ICOStatus = () => {
  const { status, tokenPrice, softCap, hardCap, totalRaised, totalTokensSold } = useSelector((state) => state.ico);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">ICO Status</h2>
      <div className="space-y-2">
        <p>Status: {status.isActive ? 'Active' : 'Inactive'}</p>
        <p>Token Price: {tokenPrice} ETH</p>
        <p>Soft Cap: {softCap} ETH</p>
        <p>Hard Cap: {hardCap} ETH</p>
        <p>Total Raised: {totalRaised} ETH</p>
        <p>Total Tokens Sold: {totalTokensSold}</p>
        <p>Time Remaining: {status.remainingTime} seconds</p>
      </div>
    </div>
  );
};

export default ICOStatus;

