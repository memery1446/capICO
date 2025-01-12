import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import BuyTokens from '../components/BuyTokens';
import WhitelistStatus from '../components/WhitelistStatus';

const mockStore = configureStore([]);

describe('WhitelistTokenPurchase Integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isWhitelisted: false,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '10',
        maxPurchaseAmount: '10',
        tokensAvailable: 1000,
        isLoading: false,
      },
    });
  });

  it('displays correct whitelist status when not whitelisted', () => {
    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText(/You are not whitelisted for this ICO./i)).toBeInTheDocument();
  });

  it('displays correct whitelist status when whitelisted', () => {
    store = mockStore({
      ico: { ...store.getState().ico, isWhitelisted: true },
    });

    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText(/You are whitelisted for this ICO./i)).toBeInTheDocument();
  });

  it('displays the buy tokens form with correct initial state', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    expect(screen.getByRole('heading', { name: 'Buy Tokens' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount of ETH to spend/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Referrer Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Current token price:/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated tokens to receive:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy Tokens' })).toBeInTheDocument();
  });

  it('disables buy button during cooldown period', () => {
    // Mock the useState hook to simulate a cooldown period
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [60, jest.fn()]);

    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    expect(buyButton).toBeDisabled();
    expect(screen.getByText(/Cooldown period:/i)).toBeInTheDocument();
  });

  it('enables buy button when there is no cooldown', () => {
    // Mock the useState hook to simulate no cooldown period
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [0, jest.fn()]);

    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    expect(buyButton).not.toBeDisabled();
    expect(screen.queryByText(/Cooldown period:/i)).not.toBeInTheDocument();
  });
});

