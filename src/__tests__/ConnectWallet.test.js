import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ConnectWallet from '../components/ConnectWallet';

const mockStore = configureStore([]);

describe('ConnectWallet', () => {
  it('renders the connect wallet button', () => {
    const store = mockStore({
      referral: {
        isWalletConnected: false,
      },
    });

    render(
      <Provider store={store}>
        <ConnectWallet />
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });

  it('still renders the connect wallet button when wallet is connected', () => {
    const store = mockStore({
      referral: {
        isWalletConnected: true,
      },
    });

    render(
      <Provider store={store}>
        <ConnectWallet />
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });
});

