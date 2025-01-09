import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';

export const withEthers = (WrappedComponent) => {
  return (props) => {
    const [ethersService, setEthersService] = useState(null);

    useEffect(() => {
      const initEthersService = async () => {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);

          const ethersService = {
            getNetwork: () => provider.getNetwork(),
            getReferralBonus: () => contract.referralBonus(),
            getCurrentReferrer: () => contract.referrers(signer.getAddress()),
            setReferrer: (referrer) => contract.setReferrer(referrer),
            getTiers: async () => {
              const tierCount = await contract.tierCount();
              const tiers = [];
              for (let i = 0; i < tierCount; i++) {
                const tier = await contract.tiers(i);
                tiers.push({
                  minPurchase: ethers.utils.formatEther(tier.minPurchase),
                  maxPurchase: ethers.utils.formatEther(tier.maxPurchase),
                  discount: tier.discount.toString()
                });
              }
              return tiers;
            },
            // Add any other methods that your components might be using
          };

          setEthersService(ethersService);
        }
      };

      initEthersService();
    }, []);

    if (!ethersService) {
      return <div>Loading ethers service...</div>;
    }

    return <WrappedComponent {...props} ethersService={ethersService} />;
  };
};

