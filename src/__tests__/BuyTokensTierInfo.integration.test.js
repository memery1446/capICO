import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([thunk]);

jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(),
    providers: {
      Web3Provider: jest.fn(),
    },
    utils: {
      parseEther: jest.fn(val => val),
    },
  },
}));

describe('BuyTokens and TierInfo Integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '10',
        maxPurchaseAmount: '10',
      },
    });
  });

  it('renders BuyTokens component without crashing', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );
    
    const buyTokensHeading = screen.getByRole('heading', { name: /buy tokens/i });
    expect(buyTokensHeading).toBeInTheDocument();
  });

  it('displays correct token price and symbol from the store', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );
    
    const tokenPriceText = screen.getByText(/current token price:/i);
    expect(tokenPriceText).toHaveTextContent('Current token price: 0.1 ETH per TEST');
  });

  it('placeholder test', () => {
    expect(true).toBe(true);
  });
});

