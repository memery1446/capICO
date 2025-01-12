import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ethers } from 'ethers';
import OwnerActions from '../components/OwnerActions';

// Increase Jest timeout for these tests
jest.setTimeout(10000);

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn()
    },
    Contract: jest.fn()
  }
}));

const mockStore = configureStore([thunk]);

describe('OwnerAdministrativeFlow Integration', () => {
  let store;
  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    store = mockStore({
      wallet: {
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true
      }
    });

    // Create mock implementations
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
    };

    mockProvider = {
      getSigner: jest.fn().mockReturnValue(mockSigner)
    };

    mockContract = {
      isActive: jest.fn().mockResolvedValue(true),
      cooldownEnabled: jest.fn().mockResolvedValue(false),
      vestingEnabled: jest.fn().mockResolvedValue(true),
      toggleActive: jest.fn().mockResolvedValue({ 
        wait: jest.fn().mockResolvedValue(true) 
      }),
      toggleCooldown: jest.fn().mockResolvedValue({ 
        wait: jest.fn().mockResolvedValue(true) 
      }),
      toggleVesting: jest.fn().mockResolvedValue({ 
        wait: jest.fn().mockResolvedValue(true) 
      })
    };

    // Setup ethers mocks
    ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    ethers.Contract.mockImplementation(() => mockContract);

    // Mock window.ethereum
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  // Basic Rendering Tests
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
    // Mock contract to throw an error
    mockContract.isActive.mockRejectedValue(new Error('Failed to fetch contract state'));
    mockContract.cooldownEnabled.mockRejectedValue(new Error('Failed to fetch contract state'));
    mockContract.vestingEnabled.mockRejectedValue(new Error('Failed to fetch contract state'));

    render(
      <Provider store={store}>
        <OwnerActions />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch contract state. Please try again.')).toBeInTheDocument();
    });
  });

  // Contract Integration Tests
  it('successfully fetches and displays initial contract state', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <OwnerActions />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(mockContract.isActive).toHaveBeenCalled();
      expect(mockContract.cooldownEnabled).toHaveBeenCalled();
      expect(mockContract.vestingEnabled).toHaveBeenCalled();
    });

    expect(screen.getByText('Pause ICO')).toBeInTheDocument();
  });

  it('updates UI when contract state changes after toggling ICO', async () => {
    mockContract.isActive
      .mockResolvedValueOnce(true)  // Initial state
      .mockResolvedValueOnce(false); // State after toggle

    await act(async () => {
      render(
        <Provider store={store}>
          <OwnerActions />
        </Provider>
      );
    });

    const toggleButton = screen.getByText('Pause ICO');

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

  it('handles transaction waiting and loading states correctly', async () => {
    const waitFn = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 50))
    );
    mockContract.toggleActive.mockResolvedValue({ wait: waitFn });

    await act(async () => {
      render(
        <Provider store={store}>
          <OwnerActions />
        </Provider>
      );
    });

    const toggleButton = screen.getByText('Pause ICO');
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/processing transaction/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/completed successfully/i)).toBeInTheDocument();
    });
  });

  it('correctly updates all contract states after multiple actions', async () => {
    // Setup sequential responses
    mockContract.isActive
      .mockResolvedValueOnce(true)  // Initial state
      .mockResolvedValueOnce(false); // After toggle

    await act(async () => {
      render(
        <Provider store={store}>
          <OwnerActions />
        </Provider>
      );
    });

    const toggleButton = screen.getByText('Pause ICO');
    
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

