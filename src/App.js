// src/App.js
import React from 'react';
import ContractTest from './components/core/ContractTest';
import ICOStatus from './components/core/ICOStatus';

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ICO Dashboard</h1>
      <div className="grid gap-6">
        <ContractTest />
        <ICOStatus />
      </div>
    </div>
  );
};

export default App;

