import React from 'react';

export const Progress = ({ value, max = 100, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-blue-600 h-2.5 rounded-full"
      style={{ width: `${(value / max) * 100}%` }}
    ></div>
  </div>
);

