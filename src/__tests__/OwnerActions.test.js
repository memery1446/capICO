import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock ethers BEFORE any other setup
jest.mock('ethers', () => {
  return {
    ethers: {
      providers: {
        Web3Provider: jest.fn()
      },
      Contract: jest.fn(),
      utils: {
        isAddress: jest.fn().mockImplementation(() => true)
      }
    }
  };
});

import OwnerActions from '../components/OwnerActions';


jest.setTimeout(10000);

describe('OwnerActions', () => {
  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };

    mockProvider = {
      getSigner: jest.fn().mockReturnValue(mockSigner)
    };

    mockContract = {
      toggleActive: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      toggleCooldown: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      toggleVesting: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      updateWhitelist: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      isActive: jest.fn().mockResolvedValue(true),
      cooldownEnabled: jest.fn().mockResolvedValue(false),
      vestingEnabled: jest.fn().mockResolvedValue(true)
    };

    // Setup the mock implementations
    require('ethers').ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    require('ethers').ethers.Contract.mockImplementation(() => mockContract);

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn()
    };
  });

  afterEach(() => {
    jest.mocked(console.error).mockRestore();
  });

 

  it('handles transaction errors correctly', async () => {
    // Setup error and suppress console.error
    const error = new Error('Transaction failed');
    mockContract.toggleActive.mockRejectedValueOnce(error);

    await act(async () => {
      render(<OwnerActions />);
    });

    const toggleButton = screen.getByRole('button', { name: /pause ico/i });
    
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to toggleActive/i)).toBeInTheDocument();
    });
  });

  it('disables buttons during transaction processing', async () => {
    // Setup a delayed transaction to ensure we can check the loading state
    const transactionPromise = new Promise(resolve => setTimeout(resolve, 100));
    mockContract.toggleActive.mockImplementation(() => transactionPromise.then(() => ({
      wait: () => Promise.resolve(true)
    })));

    await act(async () => {
      render(<OwnerActions />);
    });

    const toggleButton = screen.getByText(/pause ico/i);
    
    // Click and immediately check for disabled state
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('disabled');
      });
    });

    // Wait for transaction to complete
    await act(async () => {
      await transactionPromise;
    });
  });

    mockContract = {
      toggleActive: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      toggleCooldown: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      toggleVesting: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      updateWhitelist: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      isActive: jest.fn().mockResolvedValue(true),
      cooldownEnabled: jest.fn().mockResolvedValue(false),
      vestingEnabled: jest.fn().mockResolvedValue(true)
    };

it('handles whitelist validation correctly', async () => {
    require('ethers').ethers.utils.isAddress = jest.fn().mockReturnValue(true);
    
    await act(async () => {
      render(<OwnerActions />);
    });

    const submitButton = screen.getByRole('button', { name: /whitelist addresses/i });
    const input = screen.getByPlaceholderText(/enter addresses to whitelist/i);

    // Test with two valid addresses
    await act(async () => {
      fireEvent.change(input, { target: { value: '0x1234567890123456789012345678901234567890,0x2234567890123456789012345678901234567890' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockContract.updateWhitelist).toHaveBeenCalled();
    });
});
});

