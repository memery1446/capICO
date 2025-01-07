import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock ethers BEFORE any other setup
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn()
    },
    Contract: jest.fn()
  }
}));

import OwnerActions from '../components/OwnerActions';

describe('OwnerActions', () => {
  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };

    mockProvider = {
      getSigner: jest.fn().mockReturnValue(mockSigner)
    };

    mockContract = {
      toggleActive: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
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

  it('handles ICO toggle correctly', async () => {
    await act(async () => {
      render(<OwnerActions />);
    });
    
    const toggleButton = screen.getByRole('button', { name: /pause ico/i });
    
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      expect(mockContract.toggleActive).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/completed successfully/i)).toBeInTheDocument();
    });
  });
});

