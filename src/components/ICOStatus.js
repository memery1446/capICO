import React from 'react';
import { useSelector } from 'react-redux';

// Separate display component for better testing
export const ICOStatusDisplay = ({ 
  totalRaised, 
  hardCap, 
  tokenName, 
  tokenSymbol 
}) => {
  const progressPercentage = (parseFloat(totalRaised) / parseFloat(hardCap)) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" data-testid="ico-status">
      <h2 className="text-2xl font-bold mb-4">ICO Status</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Total Raised:</strong> {totalRaised} ETH</p>
          <p><strong>Hard Cap:</strong> {hardCap} ETH</p>
          <p><strong>Token:</strong> {tokenName} ({tokenSymbol})</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-gray-200 h-4 rounded-full">
          <div
            className="bg-blue-500 h-4 rounded-full"
            role="progressbar"
            aria-label="ICO Progress"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-center mt-2" data-testid="progress-text">
          {progressPercentage.toFixed(2)}% Raised
        </p>
      </div>
    </div>
  );
};

// Main component that handles data fetching
const ICOStatus = () => {
  const icoState = useSelector((state) => state.ico);
  
  return (
    <ICOStatusDisplay
      totalRaised={icoState.totalRaised}
      hardCap={icoState.hardCap}
      tokenName={icoState.tokenName}
      tokenSymbol={icoState.tokenSymbol}
    />
  );
};

export default ICOStatus;