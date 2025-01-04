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
import { ethers } from 'ethers';
import { ICO_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';
import WalletConnection from './components/WalletConnection';
import GlobalError from './components/GlobalError';

function AppContent() {
  const [isOwner, setIsOwner] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkOwnership = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
        
        try {
          const ownerAddress = await contract.owner();
          const signerAddress = await signer.getAddress();
          setIsOwner(ownerAddress.toLowerCase() === signerAddress.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
        }
      }
    };

    checkOwnership();
    dispatch({ type: 'START_POLLING' });
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">CapICO Dashboard</h1>
      <GlobalError />
      <WalletConnection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ICOStatus />
        {isOwner && <OwnerActions />}
        <WhitelistStatus />
        <BuyTokens />
        <TierInfo />
        <TokenVestingDashboard />
        <ReferralSystem />
        <TransactionHistory />
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

