import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useEthers } from './useEthers';
import CapICOAbi from '../abis/CapICO.json';
import TokenAbi from '../abis/Token.json';

const CAPICO_ADDRESS = '0x...'; // Your deployed CapICO contract address
const TOKEN_ADDRESS = '0x...'; // Your deployed Token contract address

export function useContracts() {
  const { signer } = useEthers();
  const [capICO, setCapICO] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (signer) {
      const capICOContract = new ethers.Contract(CAPICO_ADDRESS, CapICOAbi, signer);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TokenAbi, signer);

      setCapICO(capICOContract);
      setToken(tokenContract);
    }
  }, [signer]);

  return { capICO, token };
}

