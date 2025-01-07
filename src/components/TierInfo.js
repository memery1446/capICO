import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

const TierInfo = ({ getTiers }) => {
  const [tiers, setTiers] = useState([]);
  const [userInvestment, setUserInvestment] = useState('0');
  const [currentTier, setCurrentTier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenBalance = useSelector(state => state.ico.tokenBalance);
  const tokenPrice = useSelector(state => state.ico.tokenPrice);

  const fetchTiers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedTiers = await getTiers();
      setTiers(fetchedTiers);

      const investment = parseFloat(tokenBalance) * parseFloat(tokenPrice);
      setUserInvestment(investment.toFixed(4));

      const currentTierIndex = fetchedTiers.findIndex(
        (tier, index) => 
          investment >= parseFloat(tier.minPurchase) && 
          (index === fetchedTiers.length - 1 || investment < parseFloat(fetchedTiers[index + 1].minPurchase))
      );
      setCurrentTier(currentTierIndex);
    } catch (error) {
      console.error('Error fetching tiers:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [getTiers, tokenBalance, tokenPrice]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  if (isLoading) {
    return <div data-testid="loading">Loading tier information...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" data-testid="tier-info">
      <h2 className="text-2xl font-bold mb-4">Investment Tiers</h2>
      <p className="mb-4" data-testid="user-investment">Your estimated total investment: {userInvestment} ETH</p>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Tier</th>
              <th className="px-4 py-2">Min Purchase (ETH)</th>
              <th className="px-4 py-2">Max Purchase (ETH)</th>
              <th className="px-4 py-2">Discount (%)</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={index} className={currentTier === index ? 'bg-green-100' : ''} data-testid={`tier-${index + 1}`}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{tier.minPurchase}</td>
                <td className="border px-4 py-2">{tier.maxPurchase}</td>
                <td className="border px-4 py-2">{tier.discount}</td>
                <td className="border px-4 py-2">
                  {currentTier === index ? 'Current' : currentTier > index ? 'Achieved' : 'Not Reached'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-600" data-testid="current-tier">
        Your current tier: {currentTier !== null ? currentTier + 1 : 'None'}
      </p>
      <p className="mt-2 text-sm text-gray-600" data-testid="next-tier-requirement">
        Next tier requirement: {
          currentTier !== null && currentTier < tiers.length - 1
            ? `${tiers[currentTier + 1].minPurchase} ETH`
            : 'Max tier reached'
        }
      </p>
    </div>
  );
};

export default TierInfo;

