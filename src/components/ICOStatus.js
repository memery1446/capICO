import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ICO_ADDRESS, TOKEN_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import ICOToken from '../contracts/ICOToken.json';

const ICOStatus = () => {
  const [isActive, setIsActive] = useState(false);
  const [isCooldownEnabled, setIsCooldownEnabled] = useState(false);
  const [totalRaised, setTotalRaised] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [hardCap, setHardCap] = useState('0');
  const [tokenPrice, setTokenPrice] = useState('0');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [contractOwner, setContractOwner] = useState('');
  const [totalSupply, setTotalSupply] = useState('0');
  const [tokensRemaining, setTokensRemaining] = useState('0');
  const [error, setError] = useState(null);

  const fetchICOStatus = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const icoContract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, provider);

        const [
          active,
          cooldownEnabled,
          raised,
          cap,
          price,
          name,
          symbol,
          owner,
          address,
          supply,
          remaining
        ] = await Promise.all([
          icoContract.isActive(),
          icoContract.cooldownEnabled(),
          icoContract.totalRaised(),
          icoContract.hardCap(),
          icoContract.tokenPrice(),
          tokenContract.name(),
          tokenContract.symbol(),
          icoContract.owner(),
          signer.getAddress(),
          tokenContract.totalSupply(),
          tokenContract.balanceOf(ICO_ADDRESS)
        ]);

        setIsActive(active);
        setIsCooldownEnabled(cooldownEnabled);
        setTotalRaised(ethers.utils.formatEther(raised));
        setHardCap(ethers.utils.formatEther(cap));
        setTokenPrice(ethers.utils.formatEther(price));
        setTokenName(name);
        setTokenSymbol(symbol);
        setContractOwner(owner);
        const balance = await tokenContract.balanceOf(address);
        setTokenBalance(ethers.utils.formatEther(balance));
        setTotalSupply(ethers.utils.formatEther(supply));
        setTokensRemaining(ethers.utils.formatEther(remaining));

      } catch (error) {
        console.error('Error fetching ICO status:', error);
        setError('Failed to fetch ICO status. Please check your connection and try again.');
      }
    } else {
      setError('MetaMask is not installed. Please install it to interact with this dApp.');
    }
  };

  useEffect(() => {
    fetchICOStatus();
    const interval = setInterval(fetchICOStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const progressPercentage = (parseFloat(totalRaised) / parseFloat(hardCap)) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{tokenName} ({tokenSymbol}) ICO Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><span className="font-semibold">Active:</span> {isActive ? 'Yes' : 'No'}</p>
          <p><span className="font-semibold">Cooldown Enabled:</span> {isCooldownEnabled ? 'Yes' : 'No'}</p>
          <p><span className="font-semibold">Total Raised:</span> {parseFloat(totalRaised).toFixed(4)} ETH</p>
          <p><span className="font-semibold">Hard Cap:</span> {parseFloat(hardCap).toFixed(4)} ETH</p>
          <p><span className="font-semibold">Token Price:</span> {parseFloat(tokenPrice).toFixed(6)} ETH</p>
        </div>
        <div>
          <p><span className="font-semibold">Your Token Balance:</span> {parseFloat(tokenBalance).toFixed(4)} {tokenSymbol}</p>
          <p><span className="font-semibold">Total Supply:</span> {parseFloat(totalSupply).toFixed(0)} {tokenSymbol}</p>
          <p><span className="font-semibold">Tokens Remaining:</span> {parseFloat(tokensRemaining).toFixed(0)} {tokenSymbol}</p>
          <p><span className="font-semibold">Contract Owner:</span> {`${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className="text-center mt-2"><span className="font-semibold">Progress:</span> {progressPercentage.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default ICOStatus;

