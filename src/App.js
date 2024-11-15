import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import TierManagement from './components/TierManagement';
import WhitelistCheck from './components/WhitelistCheck';
import WhitelistManagement from './components/WhitelistManagement';
import PurchaseForm from './components/PurchaseForm';
import DistributionClaim from './components/DistributionClaim';
import WalletConnection from './components/WalletConnection';
import { CAPICO_ADDRESS, CAPICO_ABI } from './config';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 20px;
`;

const Section = styled.section`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const AdminSection = styled(Section)`
  border: 1px solid #4CAF50;
`;

function App() {
  const [capicoContract, setCapicoContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState(null);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined' && account) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
          setCapicoContract(contract);

          const owner = await contract.owner();
          setIsOwner(owner.toLowerCase() === account.toLowerCase());

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

  const handleTierUpdate = (updatedTiers) => {
    setTiers(updatedTiers);
  };

  const handlePurchase = (updatedTier) => {
    const updatedTiers = tiers.map(tier => 
      tier.startTime === updatedTier.startTime ? updatedTier : tier
    );
    setTiers(updatedTiers);
  };

  return (
    <AppWrapper>
      <ContentWrapper>
        <h1>CapICO Crowdsale</h1>
        <Section>
          <WalletConnection onConnect={handleWalletConnect} />
        </Section>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {account && capicoContract ? (
          <>
            <Section>
              <WhitelistCheck capicoContract={capicoContract} account={account} />
            </Section>
            <Section>
              <h2>Purchase Tokens</h2>
              <PurchaseForm 
                capicoContract={capicoContract} 
                account={account} 
                tiers={tiers}
                onPurchase={handlePurchase}
              />
            </Section>
            <Section>
              <h2>Claim Your Tokens</h2>
              <DistributionClaim capicoContract={capicoContract} account={account} />
            </Section>
            {isOwner && (
              <>
                <AdminSection>
                  <h2>Admin: Tier Management</h2>
                  <TierManagement onTierUpdate={handleTierUpdate} />
                </AdminSection>
                <AdminSection>
                  <h2>Admin: Whitelist Management</h2>
                  <WhitelistManagement capicoContract={capicoContract} account={account} />
                </AdminSection>
              </>
            )}
          </>
        ) : (
          <p>Please connect your wallet to participate in the CapICO crowdsale.</p>
        )}
      </ContentWrapper>
    </AppWrapper>
  );
}

export default App;
