import React, { useState, useEffect } from 'react';

export default function PauseControl({ capICOContract, account }) {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const checkPauseStatus = async () => {
      if (capICOContract) {
        const paused = await capICOContract.paused();
        setIsPaused(paused);
      }
    };
    checkPauseStatus();
  }, [capICOContract]);

  const togglePause = async () => {
    if (!capICOContract) return;
    try {
      const tx = await capICOContract[isPaused ? 'unpause' : 'pause']();
      await tx.wait();
      setIsPaused(!isPaused);
      alert(`ICO ${isPaused ? 'unpaused' : 'paused'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle pause:', error);
      alert('Failed to toggle pause. See console for details.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Pause Control</h2>
      <p className="mb-4">Current Status: {isPaused ? 'Paused' : 'Active'}</p>
      <button
        onClick={togglePause}
        className={`w-full ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white p-2 rounded`}
      >
        {isPaused ? 'Unpause ICO' : 'Pause ICO'}
      </button>
    </div>
  );
}

