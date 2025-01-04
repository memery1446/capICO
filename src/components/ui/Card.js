import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-lg ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

export const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-900">
    {children}
  </h3>
);

export const CardDescription = ({ children }) => (
  <p className="mt-1 text-sm text-gray-600">
    {children}
  </p>
);

export const CardContent = ({ children }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

