import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OwnerActions from '../components/OwnerActions';

// Mock the entire ethers library
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ...original,
    ethers: {
      providers: {
        Web3Provider: jest.fn(() => ({
          getSigner: jest.fn(() => ({
            getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          })),
        })),
      },
      Contract: jest.fn(() => ({
        isActive: jest.fn().mockResolvedValue(true),
        cooldownEnabled: jest.fn().mockResolvedValue(false),
        vestingEnabled: jest.fn().mockResolvedValue(true),
        owner: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      })),
    },
  };
});

describe('OwnerActions', () => {
  beforeEach(() => {
    // Mock window.ethereum
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the owner actions component', async () => {
    render(<OwnerActions />);

    await waitFor(() => {
      expect(screen.getByText('Owner Actions')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Pause ICO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enable Cooldown' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable Vesting' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter addresses to whitelist (comma-separated)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Whitelist Addresses' })).toBeInTheDocument();
  });

  it('handles contract state fetching', async () => {
    const mockContract = {
      isActive: jest.fn().mockResolvedValue(true),
      cooldownEnabled: jest.fn().mockResolvedValue(false),
      vestingEnabled: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(require('ethers').ethers, 'Contract').mockImplementation(() => mockContract);

    render(<OwnerActions />);

    await waitFor(() => {
      expect(mockContract.isActive).toHaveBeenCalled();
      expect(mockContract.cooldownEnabled).toHaveBeenCalled();
      expect(mockContract.vestingEnabled).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockContract = {
      isActive: jest.fn().mockRejectedValue(new Error('Contract error')),
      cooldownEnabled: jest.fn().mockRejectedValue(new Error('Contract error')),
      vestingEnabled: jest.fn().mockRejectedValue(new Error('Contract error')),
    };
    jest.spyOn(require('ethers').ethers, 'Contract').mockImplementation(() => mockContract);

    render(<OwnerActions />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch contract state. Please try again.')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

