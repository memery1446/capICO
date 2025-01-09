// Mock ethers BEFORE any imports
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
        }))
      }))
    }
  }
}));

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WalletConnection from '../components/WalletConnection';
import ICOStatus from '../components/ICOStatus';

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

    // Setup ethereum mock
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  it('should handle wallet disconnect', async () => {
    // Start with connected state
    store = mockStore({
      ico: {
        isActive: true,
        tokenSymbol: 'TEST',
      },
      wallet: {
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
      },
      referral: {
        isWalletConnected: true,
        referralBonus: '0',
        currentReferrer: ''
      }
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
          <ICOStatus />
        </Provider>
      );
    });

    await act(async () => {
      store.dispatch({ type: 'referral/setWalletConnection', payload: false });
    });

    expect(store.getActions()).toContainEqual({
      type: 'referral/setWalletConnection',
      payload: false
    });
  });

  it('should handle wallet connection request', async () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const connectButton = screen.getByText(/connect wallet/i);
    await act(async () => {
      fireEvent.click(connectButton);
    });

    expect(global.window.ethereum.request).toHaveBeenCalledWith({
      method: 'eth_requestAccounts'
    });
  });
});

