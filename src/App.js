import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import { loadUserData } from './redux/actions';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import TokenPurchase from './components/core/TokenPurchase';
import ICOStatus from './components/core/ICOStatus';
import UserAccount from './components/core/UserAccount';
import VestingSchedule from './components/vesting/VestingSchedule';
import AdminPanel from './components/admin/AdminPanel';

const AppContent = () => {
  const dispatch = useDispatch();
  const { account } = useSelector(state => state.account);

  useEffect(() => {
    if (account) {
      dispatch(loadUserData(account));
    }
  }, [dispatch, account]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
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
          <VestingSchedule />
        </div>
        <div className="mt-6">
          <AdminPanel />
        </div>
      </DashboardLayout>
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

