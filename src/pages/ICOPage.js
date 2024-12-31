import React from 'react';
import BuyTokensForm from '../components/ico/BuyTokensForm';
import ICOStatus from '../components/ico/ICOStatus';
import ClaimTokens from '../components/ico/ClaimTokens';

const ICOPage = () => {
  return (
    <div className="ico-page">
      <h1>ICO Page</h1>
      <ICOStatus />
      <BuyTokensForm />
      <ClaimTokens />
    </div>
  );
};

export default ICOPage;

