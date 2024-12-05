import React from 'react';

export const Alert = ({ children, className = '' }) => (
  <div role="alert" className={`border rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

export const AlertTitle = ({ children }) => (
  <h5 className="font-semibold mb-1">{children}</h5>
);

export const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);

