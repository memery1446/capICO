import React, { useEffect, useState } from 'react';
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
import { createEthersService } from './EthersServiceProvider';
import { updateICOInfo } from './store/icoSlice';

function AppContent() {
  const [isOwner, setIsOwner] = useState(false);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const dispatch = useDispatch();

  // Initialize provider and contract
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        try {
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            const ethService = createEthersService(web3Provider);
            setContract(ethService);
          }
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      }
    };

    initializeWeb3();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', initializeWeb3);
      }
    };
  }, []);

  const getTiers = async () => {
    if (contract) {
      try {
        const tierCount = await contract.icoContract.getTierCount();
        const tiers = [];
        for (let i = 0; i < tierCount.toNumber(); i++) {
          const tier = await contract.icoContract.getTier(i);
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
  };

  const getEthersService = () => {
    if (contract && provider) {
      return {
        getNetwork: () => provider.getNetwork(),
        getReferralBonus: async () => {
          try {
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const bonus = await contract.icoContract.referralBonuses(address);
            return ethers.utils.formatEther(bonus);
          } catch (error) {
            console.error("Error getting referral bonus:", error);
            return "0";
          }
        },
        getCurrentReferrer: async () => {
          try {
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            return contract.icoContract.referrers(address);
          } catch (error) {
            console.error("Error getting current referrer:", error);
            return null;
          }
        },
        setReferrer: (referrer) => contract.icoContract.setReferrer(referrer),
      };
    }
    return null;
  };

  useEffect(() => {
    const checkOwnership = async () => {
      if (contract && provider) {
        try {
          const ownerAddress = await contract.icoContract.owner();
          const signer = provider.getSigner();
          const signerAddress = await signer.getAddress();
          setIsOwner(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
        }
      }
    };

    checkOwnership();
    dispatch({ type: 'START_POLLING' });
  }, [contract, provider, dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">CapICO Dashboard</h1>
      <GlobalError />
      <WalletConnection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {!contract ? (
          <div className="col-span-2 text-center">
            Please connect your wallet to access the dashboard
          </div>
        ) : (
          <>
            <UserStatus />
            <ICOStatus />
            {isOwner && <OwnerActions />}
            <WhitelistStatus />
            <BuyTokens />
            <TierInfo getTiers={getTiers} />
            <TokenVestingDashboard />
            <VestingInfo />
            <ReferralSystem ethersService={getEthersService()} />
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

