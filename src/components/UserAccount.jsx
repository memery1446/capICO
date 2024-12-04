import React from 'react';
import { useSelector } from 'react-redux';

const UserAccount = () => {
  const { account, balance } = useSelector((state) => state.account);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Your Account</h2>
      <div className="space-y-2">
        <p>Address: {account}</p>
        <p>Balance: {balance} ETH</p>
      </div>
    </div>
  );
};

export default UserAccount;

