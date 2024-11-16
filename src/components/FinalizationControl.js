import React, { useState, useEffect } from 'react';

export default function FinalizationControl({ capICOContract, account }) {
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    const checkFinalizationStatus = async () => {
      if (capICOContract) {
        const finalized = await capICOContract.isFinalized();
        setIsFinalized(finalized);
      }
    };
    checkFinalizationStatus();
  }, [capICOContract]);

  const finalizeICO = async () => {
    if (!capICOContract) return;
    try {
      const tx = await capICOContract.finalize();
      await tx.wait();
      setIsFinalized(true);
      alert('ICO finalized successfully!');
    } catch (error) {
      console.error('Failed to finalize ICO:', error);
      alert('Failed to finalize ICO. See console for details.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">ICO Finalization</h2>
      {isFinalized ? (
        <p className="text-green-600 font-semibold">ICO has been finalized.</p>
      ) : (
        <>
          <p className="mb-4">ICO is not yet finalized.</p>
          <button
            onClick={finalizeICO}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Finalize ICO
          </button>
        </>
      )}
    </div>
  );
}

