import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function ICOInfo({ capICOContract, account }) {
  const [icoStatus, setIcoStatus] = useState(null);

  useEffect(() => {
    const fetchICOStatus = async () => {
      if (capICOContract && account) {
        try {
          const status = await capICOContract.getICOStatus();
          setIcoStatus(status);
        } catch (error) {
          console.error("Error fetching ICO status:", error);
          if (error.code === 'CALL_EXCEPTION') {
            console.log("Contract state may not be initialized. Please check your deployment.");
          }
        }
      }
    };

    fetchICOStatus();
  }, [capICOContract, account]);

  if (!icoStatus) return <div>Loading ICO status...</div>;

  return (
    <div>
      <h2>ICO Status</h2>
      <p>Is Active: {icoStatus.isActive ? 'Yes' : 'No'}</p>
      <p>Has Started: {icoStatus.hasStarted ? 'Yes' : 'No'}</p>
      <p>Has Ended: {icoStatus.hasEnded ? 'Yes' : 'No'}</p>
      <p>Current Time: {new Date(icoStatus.currentTime.toNumber() * 1000).toLocaleString()}</p>
      <p>Remaining Time: {icoStatus.remainingTime.toNumber()} seconds</p>
    </div>
  );
}