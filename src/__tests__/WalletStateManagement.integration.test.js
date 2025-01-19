// Basic ethers mock
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn()
    }
  }
}));

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WalletConnection from '../components/WalletConnection';

const mockStore = configureStore([thunk]);

describe('Wallet State Management', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isActive: false,
        tokenSymbol: 'TEST',
      },
      wallet: {
        isConnected: false,
        address: null,
      },
      referral: {
        isWalletConnected: false,
        referralBonus: '0',
        currentReferrer: '',
      }
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue([]),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  it('should render connect button when wallet is not connected', () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });

  it('should render disconnect button when wallet is connected', () => {
    store = mockStore({
      ico: {
        isActive: false,
        tokenSymbol: 'TEST',
      },
      wallet: {
        isConnected: true,
        address: '0x1234',
      },
      referral: {
        isWalletConnected: true,
        referralBonus: '0',
        currentReferrer: '',
      }
    });

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(screen.getByText(/disconnect/i)).toBeInTheDocument();
  });

  it('sets up account change listener correctly', () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(window.ethereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });

  it('cleans up listeners on unmount', () => {
    const { unmount } = render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    unmount();
    expect(window.ethereum.removeListener).toHaveBeenCalled();
  });
});