import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function ICOInfo({ icoStatus, capICOContract }) {
  const [tokenPrice, setTokenPrice] = useState(null);
  const [softCap, setSoftCap] = useState(null);
  const [hardCap, setHardCap] = useState(null);
  const [totalRaised, setTotalRaised] = useState(null);

  useEffect(() => {
    const fetchICOInfo = async () => {
      if (capICOContract) {
        const price = await capICOContract.tokenPrice();
        setTokenPrice(ethers.utils.formatEther(price));

        const soft = await capICOContract.softCap();
        setSoftCap(ethers.utils.formatEther(soft));

        const hard = await capICOContract.hardCap();
        setHardCap(ethers.utils.formatEther(hard));

        const raised = await capICOContract.totalRaised();
        setTotalRaised(ethers.utils.formatEther(raised));
      }
    };

    fetchICOInfo();
  }, [capICOContract]);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">ICO Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Status: {icoStatus.isActive ? 'Active' : 'Inactive'}</p>
          <p>Token Price: {tokenPrice} ETH</p>
          <p>Soft Cap: {softCap} ETH</p>
          <p>Hard Cap: {hardCap} ETH</p>
        </div>
        <div>
          <p>Total Raised: {totalRaised} ETH</p>
          <p>Started: {icoStatus.hasStarted ? 'Yes' : 'No'}</p>
          <p>Ended: {icoStatus.hasEnded ? 'Yes' : 'No'}</p>
          <p>Remaining Time: {icoStatus.remainingTime} seconds</p>
        </div>
      </div>
    </div>
  );
}

