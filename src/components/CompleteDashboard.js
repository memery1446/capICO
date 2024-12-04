import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadBlockchainData } from '../redux/actions';
import ICOStatus from './ICOStatus';
import TokenPurchase from './TokenPurchase';
import UserAccount from './UserAccount';

const CompleteDashboard = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.blockchain);

  useEffect(() => {
    dispatch(loadBlockchainData());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ICOStatus />
      <TokenPurchase />
      <UserAccount />
    </div>
  );
};

export default CompleteDashboard;

