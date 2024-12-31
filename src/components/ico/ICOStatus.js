import React from 'react';

const ICOStatus = ({ icoData }) => {
  if (!icoData) {
    return <div>Loading ICO status...</div>;
  }

  return (
    <div>
      <h2>ICO Status</h2>
      <p>Total Raised: {icoData.totalRaised} ETH</p>
      <p>Soft Cap: {icoData.softCap} ETH</p>
      <p>Hard Cap: {icoData.hardCap} ETH</p>
      <p>Is Finalized: {icoData.isFinalized ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default ICOStatus;

