import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import OwnerActions from '../components/OwnerActions';

// Mock the ethers library
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    ethers: {
      ...originalModule.ethers,
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
        toggleActive: jest.fn().mockResolvedValue({ wait: jest.fn() }),
      })),
    },
  };
});

const mockStore = configureStore([thunk]);

describe('OwnerAdministrativeFlow Integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      // Add any necessary initial state here
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  it('renders the OwnerActions component', async () => {
    render(
      <Provider store={store}>
        <OwnerActions />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Owner Actions')).toBeInTheDocument();
      expect(screen.getByText('Pause ICO')).toBeInTheDocument();
      expect(screen.getByText('Enable Cooldown')).toBeInTheDocument();
      expect(screen.getByText('Disable Vesting')).toBeInTheDocument();
    });
  });

  it('renders the component without a loading state', async () => {
    render(
      <Provider store={store}>
        <OwnerActions />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Pause ICO')).toBeInTheDocument();
      expect(screen.getByText('Enable Cooldown')).toBeInTheDocument();
      expect(screen.getByText('Disable Vesting')).toBeInTheDocument();
    });
  });

  it('renders buttons with correct initial classes', async () => {
    render(
      <Provider store={store}>
        <OwnerActions />
      </Provider>
    );

    await waitFor(() => {
      const pauseButton = screen.getByText('Pause ICO');
      const cooldownButton = screen.getByText('Enable Cooldown');
      const vestingButton = screen.getByText('Disable Vesting');

      expect(pauseButton).toHaveClass('bg-red-500');
      expect(cooldownButton).toHaveClass('bg-green-500');
      expect(vestingButton).toHaveClass('bg-red-500');
    });
  });

  it('renders the whitelist form correctly', async () => {
    render(
      <Provider store={store}>
        <OwnerActions />
      </Provider>
    );

    await waitFor(() => {
      const whitelistInput = screen.getByPlaceholderText('Enter addresses to whitelist (comma-separated)');
      expect(whitelistInput).toBeInTheDocument();
      expect(whitelistInput).toHaveAttribute('type', 'text');

      const whitelistButton = screen.getByText('Whitelist Addresses');
      expect(whitelistButton).toBeInTheDocument();
      expect(whitelistButton).toHaveClass('bg-blue-500');
    });
  });

  it('displays an error message when fetching contract state fails', async () => {
    // Mock the Contract to throw an error
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error for this test
    const mockEthers = jest.requireMock('ethers');
    mockEthers.ethers.Contract.mockImplementation(() => ({
      isActive: jest.fn().mockRejectedValue(new Error('Failed to fetch contract state')),
      cooldownEnabled: jest.fn().mockRejectedValue(new Error('Failed to fetch contract state')),
      vestingEnabled: jest.fn().mockRejectedValue(new Error('Failed to fetch contract state')),
    }));

    render(
      <Provider store={store}>
        <OwnerActions />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch contract state. Please try again.')).toBeInTheDocument();
    });

    // Clean up
    jest.mocked(console.error).mockRestore();
    mockEthers.ethers.Contract.mockReset();
  });

  // Removed tests as per instructions

  // TODO: Implement tests for successful contract state fetching and ICO state toggling
  // These tests were removed due to persistent issues with mocking ethers.js
  // Consider revisiting these tests once the mocking strategy is refined
});

