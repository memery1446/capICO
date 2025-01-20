import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createEthersService } from './EthersServiceProvider';

export const withEthers = (WrappedComponent) => {
  return (props) => {
    const [ethersService, setEthersService] = useState(null);

    useEffect(() => {
      const initEthersService = async () => {
        if (typeof window.ethereum !== 'undefined') {
          // Create both providers
          const alchemyProvider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/ehS_FNG7PZdI8QnwGIukVMfXqf4CN2Vk");
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

          try {
            // Create service with web3Provider for transactions
            const service = await createEthersService(web3Provider);
            
            // Enhanced facade that includes balance functionality
            const ethersServiceFacade = {
              getNetwork: () => web3Provider.getNetwork(),
              getReferralBonus: () => service.icoContract.referralBonuses(service.getSignerAddress()),
              getCurrentReferrer: () => service.icoContract.referrers(service.getSignerAddress()),
              setReferrer: (referrer) => service.icoContract.setReferrer(referrer),
              balanceOf: (address) => service.balanceOf(address),
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
              // Add Alchemy provider for reading logs
              provider: alchemyProvider,
              // Core service access
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

