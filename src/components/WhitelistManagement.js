import React, { useState } from 'react';

export default function WhitelistManagement({ capICOContract, account }) {
  const [addresses, setAddresses] = useState('');
  const [status, setStatus] = useState(true);

  const updateWhitelist = async () => {
    if (!capICOContract) return;
    try {
      const addressList = addresses.split(',').map(addr => addr.trim());
      const tx = await capICOContract.updateWhitelist(addressList, status);
      await tx.wait();
      alert('Whitelist updated successfully!');
    } catch (error) {
      console.error('Failed to update whitelist:', error);
      alert('Failed to update whitelist. See console for details.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Whitelist Management</h2>
      <textarea
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
        placeholder="Enter addresses separated by commas"
        className="w-full p-2 mb-2 border rounded"
        rows={4}
      />
      <div className="mb-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">Whitelist Status</span>
        </label>
      </div>
      <button
        onClick={updateWhitelist}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Update Whitelist
      </button>
    </div>
  );
}

