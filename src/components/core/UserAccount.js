import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserData } from '../../redux/actions';

const UserAccount = () => {
  const dispatch = useDispatch();
  const { account, balance } = useSelector(state => state.account);
  const { tokenBalance } = useSelector(state => state.user);

  useEffect(() => {
    if (account) {
      dispatch(loadUserData(account));
    }
  }, [account, dispatch]);

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
        <div>
          <p className="text-sm text-gray-600">Connected Address:</p>
          <p className="font-medium">{account}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">ETH Balance:</p>
          <p className="font-medium">{parseFloat(balance).toFixed(4)} ETH</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Token Balance:</p>
          <p className="font-medium">{parseFloat(tokenBalance).toFixed(4)} Tokens</p>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;

