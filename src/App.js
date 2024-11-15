import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CapICOAbi from './abis/CapICO.json';
import TokenAbi from './abis/Token.json';
import Header from './components/Header';
import WalletConnection from './components/WalletConnection';
import ICOInfo from './components/ICOInfo';
import PurchaseForm from './components/PurchaseForm';
import DistributionClaim from './components/DistributionClaim';
import RefundClaim from './components/RefundClaim';

const CapICOAddress = "YOUR_CAPICO_CONTRACT_ADDRESS";
const TokenAddress = "YOUR_TOKEN_CONTRACT_ADDRESS";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [capICOContract, setCapICOContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [icoStatus, setIcoStatus] = useState({});

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Check if ABIs are properly loaded
          if (!CapICOAbi.abi || !TokenAbi.abi) {
            throw new Error("ABI not found. Make sure the ABI files are correctly imported.");
          }

          const capICO = new ethers.Contract(CapICOAddress, CapICOAbi.abi, provider);
          setCapICOContract(capICO);

          const token = new ethers.Contract(TokenAddress, TokenAbi.abi, provider);
          setTokenContract(token);

          await updateICOStatus();
        } catch (error) {
          console.error("Initialization error:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const updateICOStatus = async () => {
    if (capICOContract) {
      try {
        const status = await capICOContract.getICOStatus();
        setIcoStatus({
          isActive: status.isActive,
          hasStarted: status.hasStarted,
          hasEnded: status.hasEnded,
          currentTime: status.currentTime.toNumber(),
          remainingTime: status.remainingTime.toNumber(),
        });
      } catch (error) {
        console.error("Failed to update ICO status:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <WalletConnection account={account} onConnect={connectWallet} />
        <ICOInfo icoStatus={icoStatus} capICOContract={capICOContract} />
        {account && (
          <>
            <PurchaseForm capICOContract={capICOContract} signer={signer} />
            <DistributionClaim capICOContract={capICOContract} signer={signer} />
            <RefundClaim capICOContract={capICOContract} signer={signer} />
          </>
        )}
      </main>
    </div>
  );
}