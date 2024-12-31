import { ethers } from 'ethers';

export const fetchICOData = async (capICO) => {
  try {
    const [totalRaised, softCap, hardCap, isFinalized] = await Promise.all([
      capICO.totalRaised(),
      capICO.softCap(),
      capICO.hardCap(),
      capICO.isFinalized(),
    ]);

    return {
      totalRaised: ethers.utils.formatEther(totalRaised),
      softCap: ethers.utils.formatEther(softCap),
      hardCap: ethers.utils.formatEther(hardCap),
      isFinalized,
    };
  } catch (error) {
    console.error('Error fetching ICO data:', error);
    throw error;
  }
};

export const buyTokens = async (capICO, amount) => {
  try {
    const tx = await capICO.buyTokens(ethers.utils.parseEther(amount), {
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error buying tokens:', error);
    throw error;
  }
};

export const fetchDistributions = async (capICO, address) => {
  try {
    const distributionsCount = await capICO.getDistributionsCount(address);
    const distributions = await Promise.all(
      Array(distributionsCount.toNumber())
        .fill()
        .map((_, index) => capICO.distributions(address, index))
    );

    return distributions.map(d => ({
      amount: ethers.utils.formatEther(d.amount),
      releaseTime: d.releaseTime.toNumber(),
      claimed: d.claimed
    }));
  } catch (error) {
    console.error('Error fetching distributions:', error);
    throw error;
  }
};

export const claimTokens = async (capICO, index) => {
  try {
    const tx = await capICO.claimDistribution(index);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
};

export const checkWhitelist = async (capICO, address) => {
  try {
    const isWhitelisted = await capICO.whitelist(address);
    return isWhitelisted;
  } catch (error) {
    console.error('Error checking whitelist status:', error);
    throw error;
  }
};

export const fetchInvestment = async (capICO, address) => {
  try {
    const investment = await capICO.investments(address);
    return ethers.utils.formatEther(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    throw error;
  }
};

export const claimRefund = async (capICO) => {
  try {
    const tx = await capICO.claimRefund();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error claiming refund:', error);
    throw error;
  }
};

export const fetchICOTimes = async (capICO) => {
  try {
    const [startTime, endTime] = await Promise.all([
      capICO.startTime(),
      capICO.endTime(),
    ]);

    return {
      startTime: startTime.toNumber(),
      endTime: endTime.toNumber(),
    };
  } catch (error) {
    console.error('Error fetching ICO times:', error);
    throw error;
  }
};

