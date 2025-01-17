import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ICOStatus from './ICOStatus';
import WhitelistStatus from './WhitelistStatus';
import BuyTokens from './BuyTokens';
import TokenVestingDashboard from './TokenVestingDashboard';
import ReferralSystem from './ReferralSystem';
import TierInfo from './TierInfo';
import TransactionHistory from './TransactionHistory';
import OwnerActions from './OwnerActions';
import UserStatus from './UserStatus';
import WalletConnection from './WalletConnection';
import GlobalError from './GlobalError';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import ICOToken from '../contracts/ICOToken.json';
import { createEthersService } from '../EthersServiceProvider';
import { updateICOInfo } from '../store/icoSlice';
import { setGlobalError } from '../store/errorSlice';

function Dashboard({ ethService }) {
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.referral.isWalletConnected);

  const initializeWeb3 = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        await web3Provider.send("eth_requestAccounts", []);
        const service = await createEthersService(web3Provider);
        ethService.current = service;
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
  }, [dispatch, ethService]);

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
    if (ethService.current && ethService.current.icoContract) {
      try {
        const tierCount = await ethService.current.icoContract.getTierCount();
        const tiers = [];
        for (let i = 0; i < tierCount.toNumber(); i++) {
          const tier = await ethService.current.icoContract.getTier(i);
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
    if (ethService.current && ethService.current.provider && ethService.current.icoContract) {
      return {
        getNetwork: async () => {
          try {
            return await ethService.current.provider.getNetwork();
          } catch (error) {
            console.error("Error getting network:", error);
            dispatch(setGlobalError("Failed to get network information. Please check your connection."));
            throw error;
          }
        },
        getReferralBonus: async () => {
          try {
            const signer = ethService.current.provider.getSigner();
            const address = await signer.getAddress();
            const bonus = await ethService.current.icoContract.referralBonuses(address);
            return ethers.utils.formatEther(bonus);
          } catch (error) {
            console.error("Error getting referral bonus:", error);
            dispatch(setGlobalError("Failed to get referral bonus. Please try again later."));
            throw error;
          }
        },
        getCurrentReferrer: async () => {
          try {
            const signer = ethService.current.provider.getSigner();
            const address = await signer.getAddress();
            return ethService.current.icoContract.referrers(address);
          } catch (error) {
            console.error("Error getting current referrer:", error);
            dispatch(setGlobalError("Failed to get current referrer. Please try again later."));
            throw error;
          }
        },
        setReferrer: async (referrer) => {
          try {
            const tx = await ethService.current.icoContract.setReferrer(referrer);
            await tx.wait();
          } catch (error) {
            console.error("Error setting referrer:", error);
            dispatch(setGlobalError("Failed to set referrer. Please try again."));
            throw error;
          }
        },
        buyTokens: ethService.current.buyTokens,
      };
    }
    return null;
  }, [ethService, dispatch]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (ethService.current && ethService.current.icoContract) {
        try {
          const ownerAddress = await ethService.current.icoContract.owner();
          const signerAddress = await ethService.current.getSignerAddress();
          setIsOwner(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
          dispatch(setGlobalError("Failed to check ownership status. Please try again later."));
        }
      }
    };

    if (ethService.current) {
      checkOwnership();
      dispatch({ type: 'START_POLLING' });
    }
  }, [ethService, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const ethersService = getEthersService();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1172' }}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-xl p-6 backdrop-blur-lg bg-opacity-90">
            <h1 className="text-4xl font-bold text-center" style={{ color: '#0A1172' }}>
              Crowdsale ICO Dashboard
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Manage your ICO participation and token investments
            </p>
          </div>
        </div>

        <GlobalError />
        
        {/* Wallet Connection Card */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <WalletConnection />
          </div>
        </div>

        {!isWalletConnected ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-2xl text-gray-700 font-semibold">
              Please connect your wallet to access the dashboard
            </div>
            <p className="text-gray-500 mt-2">
              Connect your Web3 wallet to view your ICO participation status and manage your tokens
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <UserStatus />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <ICOStatus />
              </div>
            </div>

            {/* User Interactive Features */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <BuyTokens buyTokens={ethService.current.buyTokens} />
              </div>
              {ethersService && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <ReferralSystem ethersService={ethersService} />
                </div>
              )}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <WhitelistStatus />
              </div>
            </div>

            {/* Information and Status Components */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <TierInfo getTiers={getTiers} />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <TokenVestingDashboard />
              </div>
              {isOwner && (
                <div className="bg-gray-50 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Owner Administration</h2>
                  <OwnerActions />
                </div>
              )}
            </div>

            {/* Transaction History (Full Width) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <TransactionHistory />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;



