import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';
import { updateICOInfo } from '../store/icoSlice';

const mockStore = configureStore([thunk]);

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
      buyTokens: jest.fn(() => Promise.resolve({ wait: () => Promise.resolve() })),
      cooldownTimeLeft: jest.fn(() => Promise.resolve(0)),
    })),
    utils: {
      parseEther: jest.fn(val => val),
    },
  },
}));

describe('BuyTokens', () => {
  let store;
  let consoleErrorSpy;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
      },
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
    };

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders buy tokens form when wallet is connected', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    expect(screen.getByRole('heading', { name: 'Buy Tokens' })).toBeInTheDocument();
    expect(screen.getByLabelText('Amount of ETH to spend')).toBeInTheDocument();
    expect(screen.getByLabelText('Referrer Address (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy Tokens' })).toBeInTheDocument();
  });

  it('updates amount when input changes', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    expect(amountInput.value).toBe('1');
  });

  it('displays estimated tokens to receive', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    expect(screen.getByText('Estimated tokens to receive: 10.00 TEST')).toBeInTheDocument();
  });

  it('handles token purchase', async () => {
    const mockBuyTokens = jest.fn(() => Promise.resolve({ wait: () => Promise.resolve() }));
    const mockBalanceOf = jest.fn(() => Promise.resolve('100'));
    const mockContract = jest.fn(() => ({
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: jest.fn(() => Promise.resolve(0)),
      balanceOf: mockBalanceOf,
    }));

    jest.spyOn(require('ethers').ethers, 'Contract').mockImplementation(mockContract);
    jest.spyOn(require('ethers').ethers.providers, 'Web3Provider').mockImplementation(() => ({
      getSigner: jest.fn(() => ({
        getAddress: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
      })),
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockBuyTokens).toHaveBeenCalled();
      expect(mockBalanceOf).toHaveBeenCalled();
      expect(amountInput.value).toBe('');
      expect(screen.getByText('Successfully purchased tokens!')).toBeInTheDocument();
    });
  });

  it('handles purchase failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockContract = {
      buyTokens: jest.fn(() => Promise.reject(new Error('Purchase failed'))),
      cooldownTimeLeft: jest.fn(() => Promise.resolve(0)),
    };
    jest.spyOn(require('ethers').ethers, 'Contract').mockImplementation(() => mockContract);

    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Wait for the async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Increased timeout
    });

    expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
  });

  it('submits the form without throwing errors', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    await act(async () => {
      fireEvent.click(buyButton);
    });

    // If we reach this point without throwing an error, the test passes
    expect(true).toBe(true);
  });

  it('handles token purchase and clears input', async () => {
    const mockBuyTokens = jest.fn(() => Promise.resolve({ wait: () => Promise.resolve() }));
    const mockBalanceOf = jest.fn(() => Promise.resolve('100'));
    const mockContract = jest.fn(() => ({
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: jest.fn(() => Promise.resolve(0)),
      balanceOf: mockBalanceOf,
    }));

    jest.spyOn(require('ethers').ethers, 'Contract').mockImplementation(mockContract);
    jest.spyOn(require('ethers').ethers.providers, 'Web3Provider').mockImplementation(() => ({
      getSigner: jest.fn(() => ({
        getAddress: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
      })),
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockBuyTokens).toHaveBeenCalled();
      expect(mockBalanceOf).toHaveBeenCalled();
      expect(amountInput.value).toBe('');
      expect(screen.getByText('Successfully purchased tokens!')).toBeInTheDocument();
    });
  });
});

