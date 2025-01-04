import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const AGGREGATOR_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

const AGGREGATOR_ADDRESS = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Mainnet ETH/USD
const MOCK_ETH_USD_PRICE = "2000.00"; // Mock price for local development

const PriceFeed = () => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();

          if (network.chainId === 1) { // Mainnet
            const aggregator = new ethers.Contract(AGGREGATOR_ADDRESS, AGGREGATOR_ABI, provider);
            const roundData = await aggregator.latestRoundData();
            const priceInUSD = ethers.utils.formatUnits(roundData.answer, 8);
            setPrice(parseFloat(priceInUSD).toFixed(2));
          } else { // Local development or other networks
            setPrice(MOCK_ETH_USD_PRICE);
          }
        } else {
          setPrice(MOCK_ETH_USD_PRICE);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching price:", err);
        setError("Failed to fetch the latest price");
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading price feed...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Current ETH/USD Price</h3>
      <p className="text-2xl font-bold">${price}</p>
      {!window.ethereum && (
        <p className="text-sm text-gray-500 mt-2">
          Note: This is a mock price. Install MetaMask for real-time data.
        </p>
      )}
    </div>
  );
};

export default PriceFeed;

