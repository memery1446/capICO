import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WalletConnection from '../components/WalletConnection';
import BuyTokens from '../components/BuyTokens';
import { ethers } from 'ethers';

const mockStore = configureStore([thunk]);

// Mock contract functions
const mockBuyTokens = jest.fn();
const mockCooldownTimeLeft = jest.fn();

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn(() => Promise.resolve('0x1234')),
        })),
      })),
    },
    Contract: jest.fn(() => ({
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: mockCooldownTimeLeft,
    })),
    utils: {
      parseEther: jest.fn(val => val),
    },
  },
}));

// Increase timeout for all tests
jest.setTimeout(10000);

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

    jest.clearAllMocks();
    mockBuyTokens.mockReset();
    mockCooldownTimeLeft.mockReset();

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  it('shows purchase error when transaction fails', async () => {
    store = mockStore({
      referral: {
        isWalletConnected: true,
      },
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        maxPurchaseAmount: '10',
      },
    });

    mockCooldownTimeLeft.mockResolvedValue({ toNumber: () => 0 });
    mockBuyTokens.mockRejectedValueOnce(new Error('Failed to buy tokens'));

    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    // Set amount and submit
    const amountInput = screen.getByRole('spinbutton', { name: /amount of eth to spend/i });
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1.0' } });
    });

    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Check for exact error message from component
    expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
  });

  it('disables transactions during cooldown', async () => {
    // Set up initial state
    store = mockStore({
      referral: {
        isWalletConnected: true,
      },
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        maxPurchaseAmount: '10',
      },
    });

    // Mock the cooldown time
    mockCooldownTimeLeft.mockImplementation(() => Promise.resolve({
      toNumber: () => 300 // 5 minutes in seconds
    }));

    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    // Get form elements
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    const amountInput = screen.getByRole('spinbutton', { name: /amount of eth/i });

    // Try to submit a purchase
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1.0' } });
      fireEvent.click(buyButton);
    });

    // Verify buyTokens was not called
    expect(mockBuyTokens).not.toHaveBeenCalled();
  });

  it('shows MetaMask installation message', async () => {
    delete window.ethereum;

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    
    await act(async () => {
      fireEvent.click(connectButton);
    });

    expect(screen.getByText('MetaMask is not installed. Please install it to use this feature.')).toBeInTheDocument();
  });
});

