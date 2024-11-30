import React from 'react';

const Alert = ({ children, className = '' }) => (
  <div role="alert" className={`border rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <h5 className="font-semibold mb-1">{children}</h5>
);

const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);

export { Alert, AlertTitle, AlertDescription };

