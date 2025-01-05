import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WalletConnection from '../components/WalletConnection';
import { setWalletConnection } from '../store/referralSlice';

const mockStore = configureStore([thunk]);

describe('WalletConnection', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      referral: {
        isWalletConnected: false,
      },
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  it('renders connect wallet button when not connected', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
        </Provider>
      );
    });

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('dispatches setWalletConnection action when Connect Wallet is clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
        </Provider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Connect Wallet'));
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setWalletConnection(true));
  });

  it('displays Disconnect button when wallet is connected', async () => {
    store = mockStore({
      referral: {
        isWalletConnected: true,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
        </Provider>
      );
    });

    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });
});

