import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserData } from '../../redux/actions';
import { Wallet, Clock, ArrowDownUp, ArrowUpCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { CAPICO_ADDRESS, CAPICO_ABI } from '../../config';

const UserAccount = () => {
  const dispatch = useDispatch();
  const { account, balance } = useSelector(state => state.account);
  const { tokenBalance } = useSelector(state => state.user);
  const isLoading = useSelector(state => state.blockchain.isLoading);
  const [userContribution, setUserContribution] = useState('0');

  useEffect(() => {
    if (account) {
      dispatch(loadUserData(account));
      fetchUserContribution(account);
    }
  }, [account, dispatch]);

  const fetchUserContribution = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);
      const contribution = await capicoContract.investments(address);
      setUserContribution(ethers.utils.formatEther(contribution));
    } catch (error) {
      console.error('Error fetching user contribution:', error);
    }
  };

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!account) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">User Account</h2>
        <p>Please connect your wallet to view account information.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">User Account</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Connected Address:</p>
            <p className="font-medium">{account}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">ETH Balance:</p>
            <p className="font-medium">{parseFloat(balance).toFixed(4)} ETH</p>
          </div>
        </div>
        <div className="flex items-center">
          <ArrowDownUp className="w-5 h-5 mr-2 text-purple-500" />
          <div>
            <p className="text-sm text-gray-600">Token Balance:</p>
            <p className="font-medium">{parseFloat(tokenBalance).toFixed(4)} Tokens</p>
          </div>
        </div>
        <div className="flex items-center">
          <ArrowUpCircle className="w-5 h-5 mr-2 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-600">Your Contribution:</p>
            <p className="font-medium">{parseFloat(userContribution).toFixed(4)} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;

