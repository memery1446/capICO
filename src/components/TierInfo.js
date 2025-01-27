import React, { useState, useEffect } from 'react';

const App = () => {
  const [tiers, setTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [progressToNext, setProgressToNext] = useState(0);
  const [userInvestment, setUserInvestment] = useState(0);

  const fetchTiers = async () => {
    try {
      const fetchedTiers = await getTiers(); // Assume getTiers is a function fetching tier data
      if (!Array.isArray(fetchedTiers) || fetchedTiers.length === 0) {
        console.error('Invalid or empty tiers data received');
        setTiers([]);
        setCurrentTier(null);
        return;
      }
      setTiers(fetchedTiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setTiers([]);
      setCurrentTier(null);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  useEffect(() => {
    if (tiers.length > 0 && userInvestment >= 0) {
      calculateCurrentTier();
    }
  }, [tiers, userInvestment]);

  const calculateCurrentTier = () => {
    const investment = parseFloat(userInvestment);
    const currentTierIndex = tiers.findIndex(
      (tier, index) =>
        investment >= parseFloat(tier?.minPurchase || 0) &&
        (index === tiers.length - 1 || investment < parseFloat(tiers[index + 1]?.minPurchase || Infinity))
    );

    setCurrentTier(currentTierIndex);

    if (currentTierIndex !== null && currentTierIndex < tiers.length - 1) {
      const nextTierMin = parseFloat(tiers[currentTierIndex + 1]?.minPurchase || 0);
      const currentTierMin = parseFloat(tiers[currentTierIndex]?.minPurchase || 0);
      if (nextTierMin > currentTierMin) {
        const progress = ((investment - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
        setProgressToNext(Math.min(Math.max(progress, 0), 100));
      } else {
        setProgressToNext(0);
      }
    } else {
      setProgressToNext(0);
    }
  };

  const handleInvestmentChange = (event) => {
    setUserInvestment(event.target.value);
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Investment Tiers</h1>
      <div className="mb-4">
        <label htmlFor="investment" className="block text-gray-700 font-bold mb-2">
          Investment (ETH):
        </label>
        <input
          type="number"
          id="investment"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={userInvestment}
          onChange={handleInvestmentChange}
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-gray-200 px-4 py-3 text-left">Tier</th>
            <th className="border-b border-gray-200 px-4 py-3 text-left">Investment Range (ETH)</th>
            <th className="border-b border-gray-200 px-4 py-3 text-center">Discount</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, index) => (
            <tr key={index}>
              <td className="border-b border-gray-200 px-4 py-3">{index + 1}</td>
              <td className="border-b border-gray-200 px-4 py-3">
                {tier?.minPurchase || '0'} - {tier?.maxPurchase || 'Infinity'} ETH
              </td>
              <td className="border-b border-gray-200 px-4 py-3 text-center">
                {tier?.discount || '0'}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {currentTier !== null && (
        <div className="mt-6">
          <p>
            Current Tier: {currentTier + 1} ({tiers[currentTier]?.discount || 0}% discount)
          </p>
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-4 w-full">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progressToNext}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {currentTier !== null && currentTier < tiers.length - 1 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">Next Tier Benefits</h3>
          <p className="text-blue-700 mt-1">
            Invest {(parseFloat(tiers[currentTier + 1]?.minPurchase || 0) - parseFloat(userInvestment)).toFixed(4)} more ETH to reach Tier {currentTier + 2} and get {tiers[currentTier + 1]?.discount || 0}% discount!
          </p>
        </div>
      )}
    </div>
  );
};

    // Dummy getTiers function for demo
  const getTiers = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulating network delay
    return [
      { minPurchase: 0, maxPurchase: 100, discount: 0 },
      { minPurchase: 100, maxPurchase: 500, discount: 5 },
      { minPurchase: 500, maxPurchase: 1000, discount: 10 },
      { minPurchase: 1000, maxPurchase: Infinity, discount: 15 },
    ];
  };

export default App;



