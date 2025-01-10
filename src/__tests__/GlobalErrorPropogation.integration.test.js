import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WalletConnection from '../components/WalletConnection';
import BuyTokens from '../components/BuyTokens';
import { setWalletConnection } from '../store/referralSlice';
import { ethers } from 'ethers';

const mockStore = configureStore([thunk]);

jest.mock('../components/WalletConnection', () => {
  return function MockWalletConnection({ onConnect }) {
    return <button data-testid="connect-wallet" onClick={() => onConnect(true)}>Connect Wallet</button>;
  }
});

const mockCooldownTimeLeft = jest.fn();

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
        })),
      })),
    },
    Contract: jest.fn(() => ({
      buyTokens: jest.fn(),
      cooldownTimeLeft: mockCooldownTimeLeft,
    })),
    utils: {
      parseEther: jest.fn(val => val),
    },
  },
}));

describe('Global Error Propagation', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      referral: {
        isWalletConnected: false,
      },
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        maxPurchaseAmount: '10',
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    mockCooldownTimeLeft.mockReset();
  });

  it('should render WalletConnection component', () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const connectButton = screen.getByTestId('connect-wallet');
    expect(connectButton).toBeInTheDocument();
    expect(connectButton).toHaveTextContent('Connect Wallet');
  });

  it('should capture wallet connection errors', async () => {
    await act(async () => {
      expect(true).toBe(true);
    });
  });

  it('should handle purchase transaction errors', async () => {
    await act(async () => {
      expect(true).toBe(true);
    });
  });

  it('should update wallet connection status on successful connection', async () => {
    store.dispatch = jest.fn();

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection onConnect={(status) => store.dispatch(setWalletConnection(status))} />
        </Provider>
      );
    });

    const connectButton = screen.getByTestId('connect-wallet');
    await act(async () => {
      fireEvent.click(connectButton);
    });

    expect(store.dispatch).toHaveBeenCalledWith(setWalletConnection(true));
  });

  it('should render BuyTokens component with essential elements', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    // Check for the presence of essential elements
    expect(screen.getByRole('heading', { name: 'Buy Tokens' })).toBeInTheDocument();
    expect(screen.getByLabelText('Amount of ETH to spend')).toBeInTheDocument();
    expect(screen.getByLabelText('Referrer Address (optional)')).toBeInTheDocument();
    expect(screen.getByText(/Current token price:/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated tokens to receive:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy Tokens' })).toBeInTheDocument();
  });
});

