import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DistributionWrapper = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
`;

export default function DistributionClaim({ capicoContract, account }) {
  const [distributions, setDistributions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistributions = async () => {
      if (!capicoContract || !account) return;

      try {
        const distributionCount = await capicoContract.distributions(account, 0, {});
        const fetchedDistributions = [];

        for (let i = 0; i < distributionCount.toNumber(); i++) {
          const distribution = await capicoContract.distributions(account, i, {});
          fetchedDistributions.push(distribution);
        }

        setDistributions(fetchedDistributions);
        setError(null);
      } catch (error) {
        console.error('Error fetching distributions:', error);
        setError('Failed to fetch distribution information. Please try again later.');
      }
    };

    fetchDistributions();
  }, [capicoContract, account]);

  const handleClaim = async (index) => {
    try {
      const tx = await capicoContract.claimDistribution(index, {});
      await tx.wait();
      // Refresh distributions after claiming
      const updatedDistribution = await capicoContract.distributions(account, index, {});
      setDistributions(prevDistributions => {
        const newDistributions = [...prevDistributions];
        newDistributions[index] = updatedDistribution;
        return newDistributions;
      });
    } catch (error) {
      console.error('Error claiming distribution:', error);
      setError('Failed to claim distribution. Please try again.');
    }
  };

  if (error) {
    return <DistributionWrapper>{error}</DistributionWrapper>;
  }

  return (
    <DistributionWrapper>
      <h3>Token Distributions</h3>
      {distributions.length === 0 ? (
        <p>No distributions available.</p>
      ) : (
        distributions.map((dist, index) => (
          <div key={index}>
            <p>Amount: {dist.amount.toString()} tokens</p>
            <p>Release Time: {new Date(dist.releaseTime.toNumber() * 1000).toLocaleString()}</p>
            <p>Claimed: {dist.claimed ? 'Yes' : 'No'}</p>
            {!dist.claimed && Date.now() >= dist.releaseTime.toNumber() * 1000 && (
              <Button onClick={() => handleClaim(index)}>Claim</Button>
            )}
          </div>
        ))
      )}
    </DistributionWrapper>
  );
}
