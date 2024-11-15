import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import TierManagement from './components/TierManagement';
import WhitelistCheck from './components/WhitelistCheck';
import WhitelistManagement from './components/WhitelistManagement';
import PurchaseForm from './components/PurchaseForm';
import DistributionClaim from './components/DistributionClaim';
import WalletConnection from './components/WalletConnection';
import ICOInfo from './components/ICOInfo';
import RefundClaim from './components/RefundClaim';
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

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

function App() {
  const [capicoContract, setCapicoContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [icoFinalized, setIcoFinalized] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined' && account) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
          setCapicoContract(contract);

          const ownerAddress = await contract.owner();
          setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());

          const finalized = await contract.isFinalized();
          setIcoFinalized(finalized);

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

  const handleAdvanceTier = async () => {
    if (!capicoContract) return;

    try {
      setIsLoading(true);
      const tx = await capicoContract.advanceTier();
      await tx.wait();
      setIsLoading(false);
      alert('Tier advanced successfully!');
    } catch (error) {
      console.error("Error advancing tier:", error);
      setError(`Failed to advance tier: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleFinalizeICO = async () => {
    if (!capicoContract) return;

    try {
      setIsLoading(true);
      const tx = await capicoContract.finalize();
      await tx.wait();
      setIcoFinalized(true);
      setIsLoading(false);
      alert('ICO finalized successfully!');
    } catch (error) {
      console.error("Error finalizing ICO:", error);
      setError(`Failed to finalize ICO: ${error.message}`);
      setIsLoading(false);
    }
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
              <ICOInfo capicoContract={capicoContract} />
            </Section>
            <Section>
              <WhitelistCheck capicoContract={capicoContract} account={account} />
            </Section>
            {!icoFinalized && (
              <Section>
                <h2>Purchase Tokens</h2>
                <PurchaseForm 
                  capicoContract={capicoContract} 
                  account={account}
                />
              </Section>
            )}
            <Section>
              <h2>Claim Your Tokens</h2>
              <DistributionClaim capicoContract={capicoContract} account={account} />
            </Section>
            <Section>
              <h2>Claim Refund</h2>
              <RefundClaim capicoContract={capicoContract} account={account} />
            </Section>
            {isOwner && (
              <>
                <Section>
                  <h2>Admin: Advance Tier</h2>
                  <Button onClick={handleAdvanceTier} disabled={isLoading || icoFinalized}>
                    {isLoading ? 'Processing...' : 'Advance to Next Tier'}
                  </Button>
                </Section>
                <Section>
                  <h2>Admin: Finalize ICO</h2>
                  <Button onClick={handleFinalizeICO} disabled={isLoading || icoFinalized}>
                    {isLoading ? 'Processing...' : 'Finalize ICO'}
                  </Button>
                </Section>
                <Section>
                  <h2>Admin: Tier Management</h2>
                  <TierManagement capicoContract={capicoContract} />
                </Section>
                <Section>
                  <h2>Admin: Whitelist Management</h2>
                  <WhitelistManagement capicoContract={capicoContract} account={account} />
                </Section>
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

