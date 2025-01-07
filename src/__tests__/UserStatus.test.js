import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import UserStatus from '../components/UserStatus';
import { ethers } from 'ethers';

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn()
    },
    Contract: jest.fn()
  }
}));

describe('UserStatus', () => {
  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };

    mockContract = {
      whitelist: jest.fn().mockResolvedValue(false)
    };

    mockProvider = {
      getSigner: jest.fn().mockReturnValue(mockSigner)
    };

    ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    ethers.Contract.mockImplementation(() => mockContract);

    global.window.ethereum = {};
  });

  afterEach(() => {
    global.window.ethereum = undefined;
  });

  it('renders loading state initially', async () => {
    await act(async () => {
      render(<UserStatus />);
    });
    expect(screen.getByText('Your Status')).toBeInTheDocument();
  });

  it('displays wallet status when connected', async () => {
    await act(async () => {
      render(<UserStatus />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument();
    });
  });

  it('displays error when MetaMask is not installed', async () => {
    global.window.ethereum = undefined;
    
    await act(async () => {
      render(<UserStatus />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Please install MetaMask to use this feature')).toBeInTheDocument();
    });
  });

  it('displays whitelisted status when user is whitelisted', async () => {
    mockContract.whitelist.mockResolvedValueOnce(true);
    
    await act(async () => {
      render(<UserStatus />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Whitelisted')).toBeInTheDocument();
    });
  });

  it('handles contract error gracefully', async () => {
    mockContract.whitelist.mockRejectedValueOnce(new Error('Contract error'));
    
    await act(async () => {
      render(<UserStatus />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to check whitelist status')).toBeInTheDocument();
    });
  });
});

