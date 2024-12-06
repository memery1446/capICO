// pages/index.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadBlockchainData } from '../src/redux/actions';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ICOStatus from '../components/core/ICOStatus';
import TokenPurchase from '../components/core/TokenPurchase';

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadBlockchainData());
  }, [dispatch]);

  return (
    <DashboardLayout>
      <DashboardOverview />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <ICOStatus />
        <TokenPurchase />
      </div>
    </DashboardLayout>
  );
}

