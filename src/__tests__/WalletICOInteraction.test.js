import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import WalletConnection from '../components/WalletConnection';

const mockStore = configureStore([]);

describe('WalletConnection', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      referral: {
        isWalletConnected: false,
      },
    });
  });

  it('renders connect wallet button when not connected', () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders disconnect button when connected', () => {
    store = mockStore({
      referral: {
        isWalletConnected: true,
      },
    });

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });
});

