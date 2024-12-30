// src/components/vesting/VestingSchedule.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers'; 
import { useICOStatus } from '../../hooks/useICOStatus';
import { Card } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Alert } from '../ui/Alert';

const VestingSchedule = () => {
  const [distributions, setDistributions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { contracts } = useSelector(state => state.contract);
  const { account } = useSelector(state => state.user);
  const { isFinalized } = useICOStatus(contracts?.ico);

  useEffect(() => {
    loadDistributions();
  }, [account, contracts?.ico]);

  const loadDistributions = async () => {
    if (!account || !contracts?.ico) return;

    try {
      setIsLoading(true);
      const distributionsCount = await contracts.ico.getDistributionsCount(account);
      const loadedDistributions = [];

      for (let i = 0; i < distributionsCount; i++) {
        const dist = await contracts.ico.distributions(account, i);
        loadedDistributions.push({
          index: i,
          amount: dist.amount.toString(),
          releaseTime: dist.releaseTime.toNumber(),
          claimed: dist.claimed
        });
      }

      setDistributions(loadedDistributions);
    } catch (err) {
      console.error('Failed to load distributions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (index) => {
    if (!account || !contracts?.ico) return;

    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const tx = await contracts.ico.claimDistribution(index);
      await tx.wait();

      setSuccess('Tokens claimed successfully!');
      loadDistributions(); // Refresh the distributions
    } catch (err) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateProgress = (releaseTime) => {
    const now = Math.floor(Date.now() / 1000);
    if (now >= releaseTime) return 100;
    const total = releaseTime - distributions[0]?.releaseTime;
    const elapsed = now - distributions[0]?.releaseTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (!account) {
    return (
      <Card className="p-6">
        <Alert variant="warning">Please connect your wallet to view vesting schedule.</Alert>
      </Card>
    );
  }

  if (isLoading && distributions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading vesting schedule...</div>
      </Card>
    );
  }

  if (distributions.length === 0) {
    return (
      <Card className="p-6">
        <Alert variant="info">No vesting schedule found for your address.</Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Token Vesting Schedule</h2>
      
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      <div className="space-y-6">
        {distributions.map((dist, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Distribution {index + 1}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                dist.claimed 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {dist.claimed ? 'Claimed' : 'Unclaimed'}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Amount: {ethers.utils.formatEther(dist.amount)} tokens
              </p>
              <p className="text-sm text-gray-600">
                Release Date: {formatDate(dist.releaseTime)}
              </p>
              
              <div className="mt-2">
                <Progress 
                  value={calculateProgress(dist.releaseTime)} 
                  max={100}
                  className="mb-1"
                />
                <p className="text-xs text-gray-500">
                  {calculateProgress(dist.releaseTime)}% until release
                </p>
              </div>

              {!dist.claimed && (
                <button
                  onClick={() => handleClaim(dist.index)}
                  disabled={Date.now() < dist.releaseTime * 1000 || isLoading}
                  className={`mt-2 w-full py-2 px-4 rounded font-medium ${
                    Date.now() >= dist.releaseTime * 1000 && !isLoading
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Claim Tokens'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default VestingSchedule;


