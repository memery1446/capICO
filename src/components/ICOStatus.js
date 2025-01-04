import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { ICO_ADDRESS, TOKEN_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import ICOToken from '../contracts/ICOToken.json';
import { updateICOInfo } from '../store/icoSlice';

const ICOStatus = () => {
  const dispatch = useDispatch();
  const icoState = useSelector((state) => state.ico);

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
          vestingEnabled,
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
          icoContract.vestingEnabled(),
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

        const balance = await tokenContract.balanceOf(address);

        dispatch(updateICOInfo({
          isActive: active,
          isCooldownEnabled: cooldownEnabled,
          isVestingEnabled: vestingEnabled,
          totalRaised: ethers.utils.formatEther(raised),
          hardCap: ethers.utils.formatEther(cap),
          tokenPrice: ethers.utils.formatEther(price),
          tokenName: name,
          tokenSymbol: symbol,
          contractOwner: owner,
          tokenBalance: ethers.utils.formatEther(balance),
          totalSupply: ethers.utils.formatEther(supply),
          tokensRemaining: ethers.utils.formatEther(remaining),
        }));

      } catch (error) {
        console.error('Error fetching ICO status:', error);
      }
    }
  };

  useEffect(() => {
    fetchICOStatus();
    const interval = setInterval(fetchICOStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const progressPercentage = (parseFloat(icoState.totalRaised) / parseFloat(icoState.hardCap)) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-2xl font-bold mb-4">ICO Status</h2>
      <p>Active: {icoState.isActive ? 'Yes' : 'No'}</p>
      <p>Cooldown Enabled: {icoState.isCooldownEnabled ? 'Yes' : 'No'}</p>
      <p>Vesting Enabled: {icoState.isVestingEnabled ? 'Yes' : 'No'}</p>
      <p>Total Raised: {icoState.totalRaised} ETH</p>
      <p>Hard Cap: {icoState.hardCap} ETH</p>
      <p>Token Price: {icoState.tokenPrice} ETH</p>
      <p>Token Name: {icoState.tokenName}</p>
      <p>Token Symbol: {icoState.tokenSymbol}</p>
      <p>Your Token Balance: {icoState.tokenBalance} {icoState.tokenSymbol}</p>
      <p>Total Supply: {icoState.totalSupply} {icoState.tokenSymbol}</p>
      <p>Tokens Remaining: {icoState.tokensRemaining} {icoState.tokenSymbol}</p>
      <div className="mt-4">
        <div className="bg-gray-200 h-4 rounded-full">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-center mt-2">{progressPercentage.toFixed(2)}% Raised</p>
      </div>
    </div>
  );
};

export default ICOStatus;

