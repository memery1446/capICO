import React, { useEffect, useState, useCallback } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import ICOStatus from './components/ICOStatus';
import WhitelistStatus from './components/WhitelistStatus';
import BuyTokens from './components/BuyTokens';
import TokenVestingDashboard from './components/TokenVestingDashboard';
import ReferralSystem from './components/ReferralSystem';
import TierInfo from './components/TierInfo';
import TransactionHistory from './components/TransactionHistory';
import OwnerActions from './components/OwnerActions';
import UserStatus from './components/UserStatus';
import VestingInfo from './components/VestingInfo';
import WalletConnection from './components/WalletConnection';
import GlobalError from './components/GlobalError';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';
import ICOToken from './contracts/ICOToken.json';
import { createEthersService } from './EthersServiceProvider';
import { updateICOInfo } from './store/icoSlice';

function AppContent() {
  const [isOwner, setIsOwner] = useState(false);
  const [ethService, setEthService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const initializeWeb3 = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        await web3Provider.send("eth_requestAccounts", []);
        const service = await createEthersService(web3Provider);
        setEthService(service);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing contract:", error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeWeb3();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', initializeWeb3);
      window.ethereum.on('chainChanged', initializeWeb3);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', initializeWeb3);
        window.ethereum.removeListener('chainChanged', initializeWeb3);
      }
    };
  }, [initializeWeb3]);

  const getTiers = useCallback(async () => {
    if (ethService && ethService.icoContract) {
      try {
        const tierCount = await ethService.icoContract.getTierCount();
        const tiers = [];
        for (let i = 0; i < tierCount.toNumber(); i++) {
          const tier = await ethService.icoContract.getTier(i);
          tiers.push({
            minPurchase: ethers.utils.formatEther(tier[0]),
            maxPurchase: ethers.utils.formatEther(tier[1]),
            discount: tier[2].toString()
          });
        }
        dispatch(updateICOInfo({ tiers }));
        return tiers;
      } catch (error) {
        console.error("Error fetching tiers:", error);
        return [];
      }
    }
    return [];
  }, [ethService, dispatch]);

  const getEthersService = useCallback(() => {
    if (ethService && ethService.provider && ethService.icoContract) {
      return {
        getNetwork: async () => {
          try {
            return await ethService.provider.getNetwork();
          } catch (error) {
            console.error("Error getting network:", error);
            throw error;
          }
        },
        getReferralBonus: async () => {
          try {
            const signer = ethService.provider.getSigner();
            const address = await signer.getAddress();
            const bonus = await ethService.icoContract.referralBonuses(address);
            return ethers.utils.formatEther(bonus);
          } catch (error) {
            console.error("Error getting referral bonus:", error);
            throw error;
          }
        },
        getCurrentReferrer: async () => {
          try {
            const signer = ethService.provider.getSigner();
            const address = await signer.getAddress();
            return ethService.icoContract.referrers(address);
          } catch (error) {
            console.error("Error getting current referrer:", error);
            throw error;
          }
        },
        setReferrer: async (referrer) => {
          try {
            const tx = await ethService.icoContract.setReferrer(referrer);
            await tx.wait();
          } catch (error) {
            console.error("Error setting referrer:", error);
            throw error;
          }
        },
        buyTokens: ethService.buyTokens,
      };
    }
    return null;
  }, [ethService]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (ethService && ethService.icoContract) {
        try {
          const ownerAddress = await ethService.icoContract.owner();
          const signerAddress = await ethService.getSignerAddress();
          setIsOwner(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
        }
      }
    };

    if (ethService) {
      checkOwnership();
      dispatch({ type: 'START_POLLING' });
    }
  }, [ethService, dispatch]);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  const ethersService = getEthersService();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">CapICO Dashboard</h1>
      <GlobalError />
      <WalletConnection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {!ethService ? (
          <div className="col-span-2 text-center">
            Please connect your wallet to access the dashboard
          </div>
        ) : (
          <>
            <UserStatus />
            <ICOStatus />
            {isOwner && <OwnerActions />}
            <WhitelistStatus />
            <BuyTokens buyTokens={ethService.buyTokens} />
            <TierInfo getTiers={getTiers} />
            <TokenVestingDashboard />
            <VestingInfo />
            {ethersService && <ReferralSystem ethersService={ethersService} />}
            <TransactionHistory />
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;

