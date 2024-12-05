import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet } from '../../redux/actions';

const WalletConnection = () => {
  const dispatch = useDispatch();
  const { account } = useSelector(state => state.account);

  const handleConnect = () => {
    dispatch(connectWallet());
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
  };

  return (
    <div className="mb-4">
      {account ? (
        <div>
          <span className="mr-2">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnection;

