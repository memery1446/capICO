import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function DistributionClaim({ capICOContract, signer }) {
  const [distributions, setDistributions] = useState([]);

  useEffect(() => {
    const fetchDistributions = async () => {
      if (capICOContract && signer) {
        const address = await signer.getAddress();
        const distributionCount = await capICOContract.getDistributionCount(address);
        const fetchedDistributions = [];

        for (let i = 0; i < distributionCount; i++) {
          const distribution = await capICOContract.distributions(address, i);
          fetchedDistributions.push({
            index: i,
            amount: distribution.amount.toString(),
            releaseTime: new Date(distribution.releaseTime.toNumber() * 1000),
            claimed: distribution.claimed,
          });
        }

        setDistributions(fetchedDistributions);
      }
    };

    fetchDistributions();
  }, [capICOContract, signer]);

  const handleClaim = async (index) => {
    if (capICOContract && signer) {
      try {
        const tx = await capICOContract.connect(signer).claimDistribution(index);
        await tx.wait();
        alert('Distribution claimed successfully!');
        const updatedDistributions = [...distributions];
        updatedDistributions[index].claimed = true;
        setDistributions(updatedDistributions);
      } catch (error) {
        console.error('Claim failed:', error);
        alert('Claim failed. Please check console for details.');
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Token Distributions</h2>
      {distributions.map((dist, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg">
          <p className="mb-2">Amount: {ethers.utils.formatEther(dist.amount)} tokens</p>
          <p className="mb-2">Release Time: {dist.releaseTime.toLocaleString()}</p>
          <p className="mb-2">Status: {dist.claimed ? 'Claimed' : 'Unclaimed'}</p>
          {!dist.claimed && new Date() >= dist.releaseTime && (
            <button
              onClick={() => handleClaim(dist.index)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Claim
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

