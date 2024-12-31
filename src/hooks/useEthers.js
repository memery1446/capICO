import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useEthers() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();

          setProvider(provider);
          setSigner(signer);
          setAddress(address);
        } catch (error) {
          console.error('Failed to connect wallet:', error);
        }
      } else {
        console.error('MetaMask is not installed');
      }
    };

    connectWallet();
  }, []);

  return { provider, signer, address };
}

