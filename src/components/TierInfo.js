import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const TierInfo = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTiers = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);

          const tierCount = await contract.getTierCount();
          const fetchedTiers = [];

          for (let i = 0; i < tierCount; i++) {
            const tier = await contract.getTier(i);
            fetchedTiers.push({
              minPurchase: ethers.utils.formatEther(tier[0]),
              maxPurchase: ethers.utils.formatEther(tier[1]),
              discount: tier[2].toNumber(),
            });
          }

          setTiers(fetchedTiers);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching tier info:', err);
          setError('Failed to load tier information. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchTiers();
  }, []);

  if (loading) {
    return <div>Loading tier information...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Investment Tiers</h2>
      {tiers.length === 0 ? (
        <p>No tiers available.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Tier</th>
              <th className="p-2 text-left">Min Purchase (ETH)</th>
              <th className="p-2 text-left">Max Purchase (ETH)</th>
              <th className="p-2 text-left">Discount (%)</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{tier.minPurchase}</td>
                <td className="p-2">{tier.maxPurchase}</td>
                <td className="p-2">{tier.discount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TierInfo;

