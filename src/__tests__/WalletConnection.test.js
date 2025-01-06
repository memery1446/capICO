import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import WalletConnection from '../components/WalletConnection';

// Mock the entire ethers library
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
}));

const mockStore = configureStore([]);

describe('WalletConnection', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      referral: {
        isWalletConnected: false,
      },
    });

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(screen.getByText('Wallet Connection')).toBeInTheDocument();
    expect(screen.getByText('Connect your wallet to interact with the ICO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });

  it('displays disconnect button when wallet is connected', () => {
    const store = mockStore({
      referral: {
        isWalletConnected: true,
      },
    });

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();
  });

  it('displays error message when connection fails', async () => {
    const store = mockStore({
      referral: {
        isWalletConnected: false,
      },
    });

    // Mock window.ethereum and console.error
    global.window.ethereum = {
      request: jest.fn().mockRejectedValue(new Error('User rejected the request')),
    };
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const connectButton = screen.getByRole('button', { name: 'Connect Wallet' });
    fireEvent.click(connectButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to connect wallet. Please try again.')).toBeInTheDocument();
    });

    // Verify that console.error was called with the expected error
    expect(mockConsoleError).toHaveBeenCalledWith('Error connecting wallet:', expect.any(Error));

    // Clean up the mocks
    delete global.window.ethereum;
    mockConsoleError.mockRestore();
  });
});

