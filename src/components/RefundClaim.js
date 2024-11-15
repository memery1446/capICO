import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function RefundClaim({ capICOContract, signer }) {
  const [canClaim, setCanClaim] = useState(false);
  const [investment, setInvestment] = useState('0');

  useEffect(() => {
    const checkRefundEligibility = async () => {
      if (capICOContract && signer) {
        const address = await signer.getAddress();
        const [totalRaised, softCap, endTime, isFinalized] = await Promise.all([
          capICOContract.totalRaised(),
          capICOContract.softCap(),
          capICOContract.endTime(),
          capICOContract.isFinalized(),
        ]);

        const currentTime = Math.floor(Date.now() / 1000);
        const icoEnded = currentTime > endTime.toNumber();
        const softCapNotReached = totalRaised.lt(softCap);

        setCanClaim(icoEnded && softCapNotReached && !isFinalized);

        const userInvestment = await capICOContract.investments(address);
        setInvestment(ethers.utils.formatEther(userInvestment));
      }
    };

    checkRefundEligibility();
  }, [capICOContract, signer]);

  const handleRefundClaim = async () => {
    if (capICOContract && signer) {
      try {
        const tx = await capICOContract.connect(signer).claimRefund();
        await tx.wait();
        alert('Refund claimed successfully!');
        setCanClaim(false);
        setInvestment('0');
      } catch (error) {
        console.error('Refund claim failed:', error);
        alert('Refund claim failed. Please check console for details.');
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Refund Claim</h2>
      <p className="mb-4">Your investment: {investment} ETH</p>
      {canClaim ? (
        <button
          onClick={handleRefundClaim}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Claim Refund
        </button>
      ) : (
        <p className="text-gray-600">Refund is not available at this time.</p>
      )}
    </div>
  );
}

