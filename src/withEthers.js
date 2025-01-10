import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createEthersService } from './EthersServiceProvider';

export const withEthers = (WrappedComponent) => {
  return (props) => {
    const [ethersService, setEthersService] = useState(null);

    useEffect(() => {
      const initEthersService = async () => {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          try {
            const service = await createEthersService(provider);
            
            // Create a facade that matches the interface tests expect
            const ethersServiceFacade = {
              getNetwork: () => provider.getNetwork(),
              getReferralBonus: () => service.icoContract.referralBonuses(service.getSignerAddress()),
              getCurrentReferrer: () => service.icoContract.referrers(service.getSignerAddress()),
              setReferrer: (referrer) => service.icoContract.setReferrer(referrer),
              getTiers: async () => {
                const tierCount = await service.icoContract.getTierCount();
                const tiers = [];
                for (let i = 0; i < tierCount; i++) {
                  const tier = await service.icoContract.getTier(i);
                  tiers.push({
                    minPurchase: ethers.utils.formatEther(tier.minPurchase),
                    maxPurchase: ethers.utils.formatEther(tier.maxPurchase),
                    discount: tier.discount.toString()
                  });
                }
                return tiers;
              },
              // Add the core service for direct access if needed
              _service: service,
            };

            setEthersService(ethersServiceFacade);
          } catch (error) {
            console.error("Error initializing ethers service:", error);
          }
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