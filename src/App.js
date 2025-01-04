import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import ICOStatus from './components/ICOStatus';
import WhitelistStatus from './components/WhitelistStatus';
import BuyTokens from './components/BuyTokens';
import TokenVestingDashboard from './components/TokenVestingDashboard';
import TierInfo from './components/TierInfo';
import TransactionHistory from './components/TransactionHistory';
import OwnerActions from './components/OwnerActions';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';

function App() {
  const [isOwner, setIsOwner] = useState(false);

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
  }, []);

  return (
    <Provider store={store}>
      <div style={{ marginLeft: '2rem', maxWidth: '64rem', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>CapICO Dashboard</h1>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <ICOStatus />
          {isOwner && <OwnerActions onActionComplete={() => {/* Refresh data if needed */}} />}
          <WhitelistStatus />
          <BuyTokens onPurchase={() => {/* Refresh data if needed */}} />
          <TierInfo />
          <TokenVestingDashboard />
          <TransactionHistory />
        </div>
      </div>
    </Provider>
  );
}

export default App;

