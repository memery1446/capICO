import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import TokenPurchase from './components/core/TokenPurchase';
import ICOStatus from './components/core/ICOStatus';
import UserAccount from './components/core/UserAccount';
import VestingScheduleViewer from './components/vesting/VestingScheduleViewer';
import AdminPanel from './components/admin/AdminPanel';
import Notifications from './components/ui/Notifications';
import WalletConnection from './components/core/WalletConnection';

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <WalletConnection />
        <Navigation />
        <DashboardLayout>
          <DashboardOverview />
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ICOStatus />
            <TokenPurchase />
          </div>
          <div className="mt-6">
            <UserAccount />
          </div>
          <div className="mt-6">
            <VestingScheduleViewer />
          </div>
          <div className="mt-6">
            <AdminPanel />
          </div>
        </DashboardLayout>
      </div>
      <Notifications />
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;

