import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TokenVestingDashboard from '../components/TokenVestingDashboard';
import VestingInfo from '../components/VestingInfo';
import WalletConnection from '../components/WalletConnection';

const mockStore = configureStore([thunk]);
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

// Use the mock from setupTests.js
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ethers: {
      providers: {
        Web3Provider: jest.fn(() => ({
          getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }),
          getSigner: jest.fn(() => ({
            getAddress: jest.fn().mockResolvedValue(TEST_ADDRESS),
            signMessage: jest.fn().mockResolvedValue('0xmockedsignature'),
          })),
          getBalance: jest.fn().mockResolvedValue(original.BigNumber.from('1000000000000000000')),
          on: jest.fn(),
          removeListener: jest.fn(),
        })),
      },
      utils: {
        formatEther: jest.fn(val => original.utils.formatEther(val)),
      }
    }
  };
});

describe('Vesting Flow Integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        vestingSchedule: null,
      },
      referral: {
        isWalletConnected: false,
        address: null
      }
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve([TEST_ADDRESS])),
      on: jest.fn(),
      removeListener: jest.fn(),
      isMetaMask: true,
      networkVersion: '1'
    };
  });

  it('updates VestingInfo when wallet is connected', async () => {
    render(
      <Provider store={store}>
        <WalletConnection />
        <VestingInfo />
      </Provider>
    );

    expect(screen.getByText('No vesting schedule available.')).toBeInTheDocument();

    await act(async () => {
      store.dispatch({
        type: 'referral/setWalletConnection',
        payload: true
      });
    });

    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        vestingSchedule: {
          totalAmount: '1000000',
          releasedAmount: '250000',
          startTime: Math.floor(Date.now() / 1000),
          duration: 365 * 24 * 60 * 60,
          cliff: 90 * 24 * 60 * 60
        }
      },
      referral: {
        isWalletConnected: true,
        address: TEST_ADDRESS
      }
    });

    render(
      <Provider store={store}>
        <VestingInfo />
      </Provider>
    );

    expect(screen.getByText('Vesting Schedule')).toBeInTheDocument();
  });

  it('shows error state when wallet connection fails', async () => {
    global.window.ethereum.request = jest.fn().mockRejectedValue(
      new Error('User rejected connection')
    );

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    fireEvent.click(screen.getByText('Connect Wallet'));

    await waitFor(() => {
      expect(screen.getByText('Failed to connect wallet. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles wallet disconnection correctly', async () => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        vestingSchedule: {
          totalAmount: '1000000',
          releasedAmount: '250000',
          startTime: Math.floor(Date.now() / 1000),
          duration: 365 * 24 * 60 * 60,
          cliff: 90 * 24 * 60 * 60
        }
      },
      referral: {
        isWalletConnected: true,
        address: TEST_ADDRESS
      }
    });

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const disconnectButton = screen.getByText('Disconnect');
    await act(async () => {
      fireEvent.click(disconnectButton);
    });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'referral/setWalletConnection',
      payload: false
    });
  });

  it('displays connected state when wallet is connected', async () => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        vestingSchedule: null,
      },
      referral: {
        isWalletConnected: true,
        address: TEST_ADDRESS
      }
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Your wallet is connected')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('Connected Address')).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });

  it('displays connect wallet button when not connected', async () => {
    store = mockStore({
      referral: {
        isWalletConnected: false,
        address: null
      }
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
        </Provider>
      );
    });

    const connectButton = screen.getByRole('button', { name: /Connect Wallet/i });
    expect(connectButton).toBeInTheDocument();
  });
});

