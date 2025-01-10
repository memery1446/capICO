import React, { useEffect, useState, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
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
import { setGlobalError } from './store/errorSlice';
import { Card } from './components/ui/Card';
import { withEthers } from './withEthers';

function AppContent() {
  const [isOwner, setIsOwner] = useState(false);
  const [ethService, setEthService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.referral.isWalletConnected);

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
        dispatch(setGlobalError("Failed to initialize Web3. Please check your wallet connection."));
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      dispatch(setGlobalError("Web3 not detected. Please install MetaMask or another Web3 wallet."));
    }
  }, [dispatch]);

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
        dispatch(setGlobalError("Failed to fetch tier information. Please try again later."));
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
            dispatch(setGlobalError("Failed to get network information. Please check your connection."));
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
            dispatch(setGlobalError("Failed to get referral bonus. Please try again later."));
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
            dispatch(setGlobalError("Failed to get current referrer. Please try again later."));
            throw error;
          }
        },
        setReferrer: async (referrer) => {
          try {
            const tx = await ethService.icoContract.setReferrer(referrer);
            await tx.wait();
          } catch (error) {
            console.error("Error setting referrer:", error);
            dispatch(setGlobalError("Failed to set referrer. Please try again."));
            throw error;
          }
        },
        buyTokens: ethService.buyTokens,
      };
    }
    return null;
  }, [ethService, dispatch]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (ethService && ethService.icoContract) {
        try {
          const ownerAddress = await ethService.icoContract.owner();
          const signerAddress = await ethService.getSignerAddress();
          setIsOwner(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
          dispatch(setGlobalError("Failed to check ownership status. Please try again later."));
        }
      }
    };

    if (ethService) {
      checkOwnership();
      dispatch({ type: 'START_POLLING' });
    }
  }, [ethService, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const ethersService = getEthersService();

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">CapICO Dashboard</h1>
          <GlobalError />
          <Card className="mb-8">
            <WalletConnection />
          </Card>
          {!isWalletConnected ? (
            <Card className="p-6 text-center text-gray-600 text-xl">
              Please connect your wallet to access the dashboard
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <UserStatus />
              </Card>
              <Card className="p-6">
                <ICOStatus />
              </Card>
              {isOwner && (
                <Card className="p-6 md:col-span-2">
                  <OwnerActions />
                </Card>
              )}
              <Card className="p-6">
                <WhitelistStatus />
              </Card>
              <Card className="p-6">
                <BuyTokens buyTokens={ethService.buyTokens} />
              </Card>
              <Card className="p-6">
                <TierInfo getTiers={getTiers} />
              </Card>
              <Card className="p-6">
                <TokenVestingDashboard />
              </Card>
              <Card className="p-6">
                <VestingInfo />
              </Card>
              {ethersService && (
                <Card className="p-6">
                  <ReferralSystem ethersService={ethersService} />
                </Card>
              )}
              <Card className="p-6 md:col-span-2">
                <TransactionHistory />
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const WrappedAppContent = withEthers(AppContent);

function App() {
  return (
    <Provider store={store}>
      <WrappedAppContent />
    </Provider>
  );
}

export default App;

