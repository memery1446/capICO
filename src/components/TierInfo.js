import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';

const TierInfo = () => {
  const [tiers, setTiers] = useState([]);
  const [userInvestment, setUserInvestment] = useState('0');
  const [currentTier, setCurrentTier] = useState(null);
  const tokenSymbol = useSelector(state => state.ico.tokenSymbol);
  const tokenBalance = useSelector(state => state.ico.tokenBalance);
  const tokenPrice = useSelector(state => state.ico.tokenPrice);

  useEffect(() => {
    const fetchTiers = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
          const signer = provider.getSigner();
          const address = await signer.getAddress();

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

          // Calculate user's investment based on token balance and current price
          const investment = parseFloat(tokenBalance) * parseFloat(tokenPrice);
          setUserInvestment(investment.toFixed(4));

          // Determine current tier
          const currentTierIndex = fetchedTiers.findIndex(
            (tier, index) => 
              investment >= parseFloat(tier.minPurchase) && 
              (index === fetchedTiers.length - 1 || investment < parseFloat(fetchedTiers[index + 1].minPurchase))
          );
          setCurrentTier(currentTierIndex);
        } catch (error) {
          console.error('Error fetching tiers:', error);
        }
      }
    };

    fetchTiers();
  }, [tokenBalance, tokenPrice]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Investment Tiers</h2>
      <p className="mb-4">Your estimated total investment: {userInvestment} ETH</p>
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
              <tr key={index} className={currentTier === index ? 'bg-green-100' : ''}>
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
      <p className="mt-4 text-sm text-gray-600">
        Your current tier: {currentTier !== null ? currentTier + 1 : 'None'}
      </p>
      <p className="mt-2 text-sm text-gray-600">
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

