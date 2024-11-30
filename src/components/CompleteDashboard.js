import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import actions from '../redux/actions';  // Changed this line
import { setLoading } from '../redux/blockchainSlice';

const CompleteDashboard = () => {
  console.log('HELLO FROM DASHBOARD');
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.blockchain);
  
  useEffect(() => {
    const initBlockchain = async () => {
      console.log('Loading state before init:', isLoading);
      try {
        console.log('Starting loadBlockchainData...');
        const result = await dispatch(actions.loadBlockchainData());  // Changed this line
        console.log('loadBlockchainData result:', result);
      } catch (err) {
        console.error('Error loading blockchain data:', err);
      } finally {
        console.log('Setting loading to false manually...');
        dispatch(setLoading(false));
        console.log('Loading state after setting false:', isLoading);
      }
    };
    initBlockchain();
  }, [dispatch]);

  console.log('Render cycle - loading state:', isLoading);

  if (isLoading) {
    return <div>
      Loading... 
      <button onClick={() => dispatch(setLoading(false))}>
        Force Load
      </button>
    </div>;
  }

  return <div>Loaded!</div>;
};

export default CompleteDashboard;

