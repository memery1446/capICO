import React from 'react';

export default function WalletConnection({ account, onConnect }) {
  return (
    <div className="mb-4">
      {account ? (
        <p className="text-sm text-gray-600">Connected: {account}</p>
      ) : (
        <button
          onClick={onConnect}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

