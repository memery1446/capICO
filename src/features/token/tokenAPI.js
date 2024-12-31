import { ethers } from 'ethers';

// This file contains the API calls to interact with the Token contract

export const fetchTokenBalance = async (tokenContract, address) => {
  try {
    const balance = await tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

export const transferTokens = async (tokenContract, to, amount) => {
  try {
    const tx = await tokenContract.transfer(to, ethers.utils.parseEther(amount));
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};

export const fetchTotalSupply = async (tokenContract) => {
  try {
    const totalSupply = await tokenContract.totalSupply();
    return ethers.utils.formatEther(totalSupply);
  } catch (error) {
    console.error('Error fetching total supply:', error);
    throw error;
  }
};

export const fetchAllowance = async (tokenContract, owner, spender) => {
  try {
    const allowance = await tokenContract.allowance(owner, spender);
    return ethers.utils.formatEther(allowance);
  } catch (error) {
    console.error('Error fetching allowance:', error);
    throw error;
  }
};

export const approveTokens = async (tokenContract, spender, amount) => {
  try {
    const tx = await tokenContract.approve(spender, ethers.utils.parseEther(amount));
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
};
