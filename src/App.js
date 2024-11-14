import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import TierInfo from './components/TierInfo';
import WhitelistCheck from './components/WhitelistCheck';
import DistributionClaim from './components/DistributionClaim';
import WalletConnection from './components/WalletConnection';
import PurchaseForm from './components/PurchaseForm';
import { CAPICO_ADDRESS, CAPICO_ABI } from './config';

const AppWrapper = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  color: white;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

function App() {
  const [capicoContract, setCapicoContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined' && account) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
          setCapicoContract(contract);
          setError(null);
        } catch (error) {
          console.error("Failed to initialize contract:", error);
          setError("Failed to initialize the CapICO contract. Please try refreshing the page.");
        }
      }
    };

    initContract();
  }, [account]);

  const handleWalletConnect = (connectedAccount) => {
    setAccount(connectedAccount);
  };

  return (
    <AppWrapper>
      <ContentWrapper>
        <h1>CapICO Dashboard</h1>
        <WalletConnection onConnect={handleWalletConnect} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {account && capicoContract ? (
          <>
            <TierInfo capicoContract={capicoContract} />
            <WhitelistCheck capicoContract={capicoContract} account={account} />
            <PurchaseForm capicoContract={capicoContract} account={account} />
            <DistributionClaim capicoContract={capicoContract} account={account} />
          </>
        ) : (
          <p>Please connect your wallet to interact with the CapICO dashboard.</p>
        )}
      </ContentWrapper>
    </AppWrapper>
  );
}

export default App;

