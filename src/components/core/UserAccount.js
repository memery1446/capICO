// src/components/core/UserAccount.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserData } from '../../redux/actions';
import { Card } from '../ui/Card';
import { ethers } from 'ethers';

const UserAccount = () => {
  const dispatch = useDispatch();
  const { account, balance, tokenBalance, isWhitelisted } = useSelector(state => state.user);

  useEffect(() => {
    if (account) {
      dispatch(loadUserData());
    }
  }, [account, dispatch]);

  if (!account) {
    return null;
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-2">Account Info</h2>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="text-gray-500">Address:</span>
          <span className="ml-2 font-mono">
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">ETH Balance:</span>
          <span className="ml-2">{ethers.utils.formatEther(balance)} ETH</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Token Balance:</span>
          <span className="ml-2">{ethers.utils.formatEther(tokenBalance)} tokens</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Status:</span>
          <span className={`ml-2 ${isWhitelisted ? 'text-green-500' : 'text-red-500'}`}>
            {isWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}
          </span>
        </p>
      </div>
    </Card>
  );
};

export default UserAccount;


