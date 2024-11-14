import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { loadBlockchainData } from './redux/actions';
import Header from './components/Header';
import ICOInfo from './components/ICOInfo';
import PurchaseForm from './components/PurchaseForm';
import AccountInfo from './components/AccountInfo';

const AppWrapper = styled.div`
  background-color: #588bae;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  padding: 20px;
`;

export default function App() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.blockchain);

  useEffect(() => {
    dispatch(loadBlockchainData());
  }, [dispatch]);

  if (isLoading) {
    return <AppWrapper>Loading...</AppWrapper>;
  }

  if (error) {
    return <AppWrapper>Error: {error}</AppWrapper>;
  }

  return (
    <AppWrapper>
      <Header />
      <ContentWrapper>
        <ICOInfo />
        <PurchaseForm />
        <AccountInfo />
      </ContentWrapper>
    </AppWrapper>
  );
}