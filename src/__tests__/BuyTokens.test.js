import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';
import TierInfo from '../components/TierInfo';
import { updateICOInfo } from '../store/icoSlice';
import { ethers } from 'ethers';

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
    BigNumber: {
      from: jest.fn(val => ({
        toNumber: () => parseInt(val),
        toString: () => val
      }))
    }
  },
}));

jest.mock('../components/TierInfo', () => {
  return jest.fn(() => <div data-testid="mock-tier-info" />);
});

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
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  jest.setTimeout(10000);

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

  it('handles increment button click', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const incrementButton = screen.getByText('▲');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '0' } });
    });

    await act(async () => {
      fireEvent.click(incrementButton);
    });

    expect(amountInput.value).toBe('0.01');
  });

  it('handles decrement button click', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const decrementButton = screen.getByText('▼');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '0.02' } });
    });

    await act(async () => {
      fireEvent.click(decrementButton);
    });

    expect(amountInput.value).toBe('0.01');

    await act(async () => {
      fireEvent.click(decrementButton);
    });

    expect(amountInput.value).toBe('0.00');

    await act(async () => {
      fireEvent.click(decrementButton);
    });

    expect(amountInput.value).toBe('0.00');
  });

  it('handles cooldown period display', async () => {
    const mockContract = {
      cooldownTimeLeft: jest.fn().mockResolvedValue({
        toNumber: () => 300
      }),
      buyTokens: jest.fn()
    };

    jest.spyOn(require('ethers').ethers, 'Contract')
      .mockImplementation(() => mockContract);

    jest.spyOn(require('ethers').ethers.providers, 'Web3Provider')
      .mockImplementation(() => ({
        getSigner: () => ({
          getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890')
        })
      }));

    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    await waitFor(() => {
      const cooldownText = screen.getByText('Cooldown period: 05:00 remaining');
      expect(cooldownText).toBeInTheDocument();
      expect(cooldownText).toHaveClass('mb-4', 'text-yellow-600');
    }, { timeout: 5000 });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    expect(buyButton).toBeDisabled();
  });

  it('handles successful token purchase', async () => {
    const mockWait = jest.fn().mockResolvedValue(true);
    const mockBuyTokens = jest.fn().mockResolvedValue({ wait: mockWait });
    const mockBalanceOf = jest.fn().mockResolvedValue(ethers.BigNumber.from('1000'));
    
    const mockContract = {
      buyTokens: mockBuyTokens,
      balanceOf: mockBalanceOf,
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 })
    };

    jest.spyOn(require('ethers').ethers, 'Contract')
      .mockImplementation(() => mockContract);

    jest.spyOn(require('ethers').ethers.utils, 'parseEther')
      .mockImplementation(val => val);

    jest.spyOn(require('ethers').ethers.providers, 'Web3Provider')
      .mockImplementation(() => ({
        getSigner: () => ({
          getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890')
        })
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

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    await waitFor(() => {
      expect(mockBuyTokens).toHaveBeenCalled();
      expect(mockWait).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Successfully purchased tokens!')).toBeInTheDocument();
    });

    expect(amountInput.value).toBe('');
    expect(mockBalanceOf).toHaveBeenCalled();
  });

  it('handles token purchase errors correctly', async () => {
    const mockBuyTokens = jest.fn().mockRejectedValue(new Error('Transaction failed'));
    
    const mockContract = {
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 })
    };

    jest.spyOn(require('ethers').ethers, 'Contract')
      .mockImplementation(() => mockContract);

    jest.spyOn(require('ethers').ethers.providers, 'Web3Provider')
      .mockImplementation(() => ({
        getSigner: () => ({
          getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890')
        })
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
    
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
    });

    expect(buyButton).not.toBeDisabled();
    expect(amountInput.value).toBe('1');
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
  });

  it('handles invalid referral address', async () => {
    const mockBuyTokens = jest.fn().mockRejectedValue(new Error('Invalid referrer'));
    
    const mockContract = {
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 })
    };

    jest.spyOn(require('ethers').ethers, 'Contract')
      .mockImplementation(() => mockContract);

    jest.spyOn(require('ethers').ethers.providers, 'Web3Provider')
      .mockImplementation(() => ({
        getSigner: () => ({
          getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890')
        })
      }));

    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const referrerInput = screen.getByLabelText('Referrer Address (optional)');
    const invalidAddress = '0xinvalid';
    await act(async () => {
      fireEvent.change(referrerInput, { target: { value: invalidAddress } });
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
    });

    expect(buyButton).not.toBeDisabled();
    expect(referrerInput.value).toBe(invalidAddress);
    expect(amountInput.value).toBe('1');
    expect(mockBuyTokens).toHaveBeenCalled();
  });

  it('handles negative amount inputs appropriately', async () => {
    const mockContract = {
      buyTokens: jest.fn(),
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 })
    };

    jest.spyOn(require('ethers').ethers, 'Contract')
      .mockImplementation(() => mockContract);

    await act(async () => {
      render(
        <Provider store={store}>
          <BuyTokens />
        </Provider>
      );
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '-1' } });
    });

    expect(screen.getByText('Estimated tokens to receive: -10.00 TEST')).toBeInTheDocument();

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(mockContract.buyTokens).not.toHaveBeenCalled();
    expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
  });
});