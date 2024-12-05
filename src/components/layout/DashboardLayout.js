import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

