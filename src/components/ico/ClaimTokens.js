import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDistributions, claimTokens } from '../../features/ico/icoSlice';

const ClaimTokens = () => {
  const dispatch = useDispatch();
  const { distributions, loading, error } = useSelector(state => state.ico);

  useEffect(() => {
    dispatch(fetchDistributions());
  }, [dispatch]);

  const handleClaim = (index) => {
    dispatch(claimTokens(index));
  };

  if (loading) return <p>Loading distributions...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!distributions || distributions.length === 0) return <p>No distributions available.</p>;

  return (
    <div className="claim-tokens">
      <h2>Claim Tokens</h2>
      {distributions.map((dist, index) => (
        <div key={index}>
          <p>Amount: {dist.amount} Tokens</p>
          <p>Release Time: {new Date(dist.releaseTime * 1000).toLocaleString()}</p>
          {!dist.claimed && Date.now() >= dist.releaseTime * 1000 && (
            <button onClick={() => handleClaim(index)}>Claim</button>
          )}
          {dist.claimed && <p>Claimed</p>}
        </div>
      ))}
    </div>
  );
};

export default ClaimTokens;

