import { ethers } from 'ethers';

export const shortenAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei) => {
  return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
};

export const parseEther = (ether) => {
  return ethers.utils.parseEther(ether.toString());
};

