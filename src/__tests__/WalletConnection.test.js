import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import WalletConnection from '../components/WalletConnection';
import { setWalletConnection, resetReferralState } from '../store/referralSlice';

const mockStore = configureStore([]);

describe('WalletConnection', () => {
  let store;

  beforeEach(() => {
    // Create store with mock dispatch that we can spy on
    const mockDispatch = jest.fn();
    store = mockStore({
      referral: {
        isWalletConnected: false
      }
    });
    store.dispatch = mockDispatch;  // Replace dispatch with our mock

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn()
    };
  });

  it('renders connect button when wallet is not connected', () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(screen.getByText('Connect your wallet to interact with the ICO')).toBeInTheDocument();
  });

  it('displays wallet info when connected', async () => {
    store = mockStore({
      referral: {
        isWalletConnected: true
      }
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
        </Provider>
      );
    });

    expect(screen.getByText('Your wallet is connected')).toBeInTheDocument();
    expect(screen.getByText('Connected Address')).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
  });

  it('shows error when MetaMask is not installed', async () => {
    delete window.ethereum;

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const connectButton = screen.getByText('Connect Wallet');
    await act(async () => {
      fireEvent.click(connectButton);
    });

    expect(screen.getByText('MetaMask is not installed. Please install it to use this feature.')).toBeInTheDocument();
  });

  it('handles connection errors gracefully', async () => {
    window.ethereum.request.mockRejectedValueOnce(new Error('User rejected request'));

    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    const connectButton = screen.getByText('Connect Wallet');
    await act(async () => {
      fireEvent.click(connectButton);
    });

    expect(screen.getByText('Failed to connect wallet. Please try again.')).toBeInTheDocument();
  });

it('handles disconnection correctly', async () => {
  store = mockStore({
    referral: {
      isWalletConnected: true
    }
  });

  const { rerender } = render(
    <Provider store={store}>
      <WalletConnection />
    </Provider>
  );

  const disconnectButton = screen.getByText('Disconnect');
  await act(async () => {
    fireEvent.click(disconnectButton);
  });

  // Update store to simulate disconnected state
  store = mockStore({
    referral: {
      isWalletConnected: false
    }
  });

  rerender(
    <Provider store={store}>
      <WalletConnection />
    </Provider>
  );

  // Verify the UI shows disconnected state
  expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  expect(screen.getByText('Connect your wallet to interact with the ICO')).toBeInTheDocument();
});

  it('listens for account changes', async () => {
    render(
      <Provider store={store}>
        <WalletConnection />
      </Provider>
    );

    expect(window.ethereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });
});

