import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConnectWallet from './components/ConnectWallet';
import ICOStatus from './components/ICOStatus';
import BuyTokens from './components/BuyTokens';
import UserStatus from './components/UserStatus';
import OwnerActions from './components/OwnerActions';
import { ICO_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConnect = async (connected) => {
    setIsConnected(connected);
    if (connected) {
      await checkOwnerStatus();
    }
  };

  const checkOwnerStatus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
      const owner = await contract.owner();
      const address = await signer.getAddress();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    }
  };

  const handleActionComplete = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(oldKey => oldKey + 1);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-5 text-center text-gray-800">Welcome to CapICO Demo</h1>
          <ConnectWallet onConnect={handleConnect} />
          {isConnected && (
            <>
              <ICOStatus key={refreshKey} />
              <UserStatus key={`user-${refreshKey}`} />
              <BuyTokens onPurchase={handleActionComplete} />
              {isOwner && <OwnerActions onActionComplete={handleActionComplete} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

