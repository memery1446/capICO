import React from 'react';
import { useSelector } from 'react-redux';

const TierInfo = () => {
  const tiers = useSelector((state) => state.ico.tiers);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Investment Tiers</h3>
      {tiers.length === 0 ? (
        <p>No tiers available.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Min Purchase</th>
              <th className="text-left">Max Purchase</th>
              <th className="text-left">Discount</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={index}>
                <td>{tier.minPurchase} ETH</td>
                <td>{tier.maxPurchase} ETH</td>
                <td>{tier.discount}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TierInfo;

