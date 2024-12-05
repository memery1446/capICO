import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateICOParams } from '../../redux/actions';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const [tokenPrice, setTokenPrice] = useState('');
  const [softCap, setSoftCap] = useState('');
  const [hardCap, setHardCap] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateICOParams({
      tokenPrice,
      softCap,
      hardCap,
      startDate,
      endDate
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">Token Price (ETH)</label>
          <input
            id="tokenPrice"
            type="number"
            value={tokenPrice}
            onChange={(e) => setTokenPrice(e.target.value)}
            placeholder="0.01"
            step="0.000000000000000001"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="softCap" className="block text-sm font-medium text-gray-700">Soft Cap (ETH)</label>
          <input
            id="softCap"
            type="number"
            value={softCap}
            onChange={(e) => setSoftCap(e.target.value)}
            placeholder="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="hardCap" className="block text-sm font-medium text-gray-700">Hard Cap (ETH)</label>
          <input
            id="hardCap"
            type="number"
            value={hardCap}
            onChange={(e) => setHardCap(e.target.value)}
            placeholder="1000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            id="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Update ICO Parameters
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;

