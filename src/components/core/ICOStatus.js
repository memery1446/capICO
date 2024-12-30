// src/components/core/ICOStatus.js
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ICOArtifact from '../../artifacts/contracts/CapICO.sol/CapICO.json';

const CONTRACT_ADDRESSES = {
  ICO: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
};

const ICOStatus = () => {
  const [status, setStatus] = useState('Loading...');
  const [icoData, setIcoData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  
  // Keep track of Hardhat provider
  const [hardhatProvider] = useState(
    new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  );

  useEffect(() => {
    const loadICOData = async (blockNumber) => {
      try {
        const icoContract = new ethers.Contract(
          CONTRACT_ADDRESSES.ICO,
          ICOArtifact.abi,
          hardhatProvider
        );

        const [
          startTime,
          endTime,
          tokenPrice,
          softCap,
          hardCap,
          minInvestment,
          maxInvestment,
          totalRaised,
          totalTokensSold,
          isFinalized
        ] = await Promise.all([
          icoContract.startTime({ blockTag: blockNumber }),
          icoContract.endTime({ blockTag: blockNumber }),
          icoContract.tokenPrice({ blockTag: blockNumber }),
          icoContract.softCap({ blockTag: blockNumber }),
          icoContract.hardCap({ blockTag: blockNumber }),
          icoContract.minInvestment({ blockTag: blockNumber }),
          icoContract.maxInvestment({ blockTag: blockNumber }),
          icoContract.totalRaised({ blockTag: blockNumber }),
          icoContract.totalTokensSold({ blockTag: blockNumber }),
          icoContract.isFinalized({ blockTag: blockNumber })
        ]);

        const now = Math.floor(Date.now() / 1000);
        const hasStarted = now >= startTime.toNumber();
        const hasEnded = now > endTime.toNumber();
        const isActive = hasStarted && !hasEnded && !isFinalized;

        let remaining;
        if (!hasStarted) {
          remaining = startTime.toNumber() - now;
          setStatus('ICO Not Started');
        } else if (!hasEnded) {
          remaining = endTime.toNumber() - now;
          setStatus(isActive ? 'ICO Active' : 'ICO Paused');
        } else {
          remaining = 0;
          setStatus(isFinalized ? 'ICO Finalized' : 'ICO Ended');
        }

        setTimeRemaining(remaining);
        setIcoData({
          tokenPrice: ethers.utils.formatEther(tokenPrice),
          softCap: ethers.utils.formatEther(softCap),
          hardCap: ethers.utils.formatEther(hardCap),
          minInvestment: ethers.utils.formatEther(minInvestment),
          maxInvestment: ethers.utils.formatEther(maxInvestment),
          totalRaised: ethers.utils.formatEther(totalRaised),
          totalTokensSold: ethers.utils.formatEther(totalTokensSold),
          progress: (totalRaised.mul(100).div(hardCap)).toNumber(),
          isActive,
          isFinalized
        });

      } catch (err) {
        console.error('Error loading ICO data:', err);
        setStatus('Error loading ICO data');
      }
    };

    const init = async () => {
      const blockNumber = await hardhatProvider.getBlockNumber();
      setCurrentBlock(blockNumber);
      await loadICOData(blockNumber);
    };

    init();

    // Update time remaining every second
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        setTimeRemaining(prev => prev - 1);
      }
    }, 1000);

    // Update data every new block
    const blockListener = async (blockNumber) => {
      setCurrentBlock(blockNumber);
      await loadICOData(blockNumber);
    };

    hardhatProvider.on('block', blockListener);

    return () => {
      clearInterval(timer);
      hardhatProvider.off('block', blockListener);
    };
  }, [hardhatProvider]);

  const formatTime = (seconds) => {
    if (!seconds) return '0d 0h 0m 0s';
    const d = Math.floor(seconds / (24 * 60 * 60));
    const h = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const m = Math.floor((seconds % (60 * 60)) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 4
    }).format(num);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">ICO Status</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Current Status:</span>
            <span className={`px-3 py-1 rounded-full ${
              icoData?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Time Remaining:</span>
            <div className="text-2xl font-bold mt-1">{formatTime(timeRemaining)}</div>
          </div>

          {icoData && (
            <>
              <div>
                <span className="font-medium">Progress:</span>
                <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${icoData.progress}%` }}
                  />
                </div>
                <div className="mt-1 text-sm text-gray-600 flex justify-between">
                  <span>{formatNumber(icoData.totalRaised)} ETH raised</span>
                  <span>{formatNumber(icoData.hardCap)} ETH goal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="text-sm text-gray-600">Soft Cap</span>
                  <div className="font-medium">{formatNumber(icoData.softCap)} ETH</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Hard Cap</span>
                  <div className="font-medium">{formatNumber(icoData.hardCap)} ETH</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Min Investment</span>
                  <div className="font-medium">{formatNumber(icoData.minInvestment)} ETH</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Max Investment</span>
                  <div className="font-medium">{formatNumber(icoData.maxInvestment)} ETH</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Token Price</span>
                  <div className="font-medium">{formatNumber(icoData.tokenPrice)} ETH</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tokens Sold</span>
                  <div className="font-medium">{formatNumber(icoData.totalTokensSold)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICOStatus;

