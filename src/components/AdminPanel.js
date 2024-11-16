import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function AdminPanel({ capICOContract, account }) {
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const updateICOTime = async () => {
    if (!capICOContract) return;
    try {
      const tx = await capICOContract.updateICOTime(
        ethers.BigNumber.from(new Date(newStartTime).getTime() / 1000),
        ethers.BigNumber.from(new Date(newEndTime).getTime() / 1000)
      );
      await tx.wait();
      alert('ICO time updated successfully!');
    } catch (error) {
      console.error('Failed to update ICO time:', error);
      alert('Failed to update ICO time. See console for details.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Update ICO Time</h3>
        <input
          type="datetime-local"
          value={newStartTime}
          onChange={(e) => setNewStartTime(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="datetime-local"
          value={newEndTime}
          onChange={(e) => setNewEndTime(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={updateICOTime}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Update ICO Time
        </button>
      </div>
    </div>
  );
}

