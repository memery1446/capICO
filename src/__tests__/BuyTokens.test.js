import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';
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
    // Clear all timers
    jest.useRealTimers();
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

    // Ensure we start with a clean value
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

    // Set initial value to 0.02
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '0.02' } });
    });

    // Click decrement
    await act(async () => {
      fireEvent.click(decrementButton);
    });

    expect(amountInput.value).toBe('0.01');

    // Click decrement again
    await act(async () => {
      fireEvent.click(decrementButton);
    });

    // Should stop at 0
    expect(amountInput.value).toBe('0.00');

    // One more decrement should not go below 0
    await act(async () => {
      fireEvent.click(decrementButton);
    });

    expect(amountInput.value).toBe('0.00');
  });

it('handles cooldown period display', async () => {
    // Mock the contract with a cooldown value
    const mockContract = {
      cooldownTimeLeft: jest.fn().mockResolvedValue({
        toNumber: () => 300 // 5 minutes in seconds
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

    // The useEffect will call checkCooldown, which will set the cooldown time
    // We need to wait for the text to appear
    await waitFor(() => {
      const cooldownText = screen.getByText('Cooldown period: 05:00 remaining');
      expect(cooldownText).toBeInTheDocument();
      expect(cooldownText).toHaveClass('mb-4', 'text-yellow-600');
    }, { timeout: 3000 });

    // Check that the button is disabled during cooldown
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    expect(buyButton).toBeDisabled();
  });

it('handles successful token purchase', async () => {
    // Mock the contract functions
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

    // Set amount to purchase
    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    // Click the buy button
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Check that the contract method was called with correct value
    await waitFor(() => {
      expect(mockBuyTokens).toHaveBeenCalled();
      expect(mockWait).toHaveBeenCalled();
    });

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Successfully purchased tokens!')).toBeInTheDocument();
    });

    // Check that the input was cleared
    expect(amountInput.value).toBe('');

    // Check that balanceOf was called to update the state
    expect(mockBalanceOf).toHaveBeenCalled();
  });

  it('handles token purchase errors correctly', async () => {
    // Mock the contract with a failing transaction
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

    // Set amount to purchase
    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    // Initial state check
    expect(screen.queryByText('Failed to buy tokens. Please try again.')).not.toBeInTheDocument();
    
    // Click the buy button
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Check that error message appears
    await waitFor(() => {
      expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
    });

    // Verify error state
    expect(buyButton).not.toBeDisabled(); // Button should be enabled for retry
    expect(amountInput.value).toBe('1');  // Amount should be preserved

    // Check loading state was properly reset
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
  });

  it('handles invalid referral address', async () => {
    // Mock the contract to reject the transaction
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

    // Set invalid referrer address
    const referrerInput = screen.getByLabelText('Referrer Address (optional)');
    const invalidAddress = '0xinvalid';
    await act(async () => {
      fireEvent.change(referrerInput, { target: { value: invalidAddress } });
    });

    // Set amount
    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    // Try to submit
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Verify the generic error message appears
    await waitFor(() => {
      expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
    });

    // Verify form state
    expect(buyButton).not.toBeDisabled();
    expect(referrerInput.value).toBe(invalidAddress); // Value should be preserved
    expect(amountInput.value).toBe('1'); // Amount should be preserved
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
    
    // Try to set a negative value
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '-1' } });
    });

    // Should show negative estimated tokens (matching the calculation logic)
    expect(screen.getByText('Estimated tokens to receive: -10.00 TEST')).toBeInTheDocument();

    // Attempt to submit with negative value
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Contract should not be called with negative amount
    expect(mockContract.buyTokens).not.toHaveBeenCalled();

    // Should show error message
    expect(screen.getByText('Failed to buy tokens. Please try again.')).toBeInTheDocument();
  });

  
  // More tests can be added here for:
  // - Token purchase functionality
  // - Referral system
  // - Error handling
  // - Network interactions
});

