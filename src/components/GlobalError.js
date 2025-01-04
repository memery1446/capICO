import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearGlobalError } from '../store/errorSlice';

const GlobalError = () => {
  const error = useSelector((state) => state.error.globalError);
  const dispatch = useDispatch();

  if (!error) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
        <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => dispatch(clearGlobalError())}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GlobalError;

