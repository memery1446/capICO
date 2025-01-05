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
  let consoleErrorSpy;

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

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
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

  it('handles wallet connection failure', async () => {
    global.window.ethereum.request.mockRejectedValueOnce(new Error('User rejected the request'));

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

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error connecting wallet:', expect.any(Error));
    expect(store.getActions()).not.toContainEqual(setWalletConnection(true));
  });

  it('dispatches setWalletConnection action when Disconnect is clicked', async () => {
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

    await act(async () => {
      fireEvent.click(screen.getByText('Disconnect'));
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setWalletConnection(false));
  });
});

