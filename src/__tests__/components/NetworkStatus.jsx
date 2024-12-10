// src/__tests__/components/NetworkStatus.test.jsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, CHAIN_IDS, mockNetworkSwitch } from '../../utils/testUtils';
import NetworkStatus from '../../components/core/NetworkStatus';

describe('NetworkStatus Component', () => {
  it('shows correct network when on Sepolia', () => {
    renderWithProviders(<NetworkStatus />, {
      initialState: {
        blockchain: {
          chainId: CHAIN_IDS.SEPOLIA,
          isCorrectNetwork: true
        }
      }
    });

    expect(screen.getByText(/Connected to Sepolia/i)).toBeInTheDocument();
  });

  it('shows warning when on wrong network', () => {
    renderWithProviders(<NetworkStatus />, {
      initialState: {
        blockchain: {
          chainId: CHAIN_IDS.HARDHAT,
          isCorrectNetwork: false
        }
      }
    });

    expect(screen.getByText(/Please switch to Sepolia/i)).toBeInTheDocument();
  });

  it('handles network switching', async () => {
    const { store } = renderWithProviders(<NetworkStatus />, {
      initialState: {
        blockchain: {
          chainId: CHAIN_IDS.HARDHAT,
          isCorrectNetwork: false
        }
      }
    });

    // Mock the network switch
    await mockNetworkSwitch(CHAIN_IDS.SEPOLIA);

    // Click the switch network button
    fireEvent.click(screen.getByText(/Switch Network/i));

    await waitFor(() => {
      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'blockchain/setChainId',
          payload: CHAIN_IDS.SEPOLIA
        })
      );
    });
  });
});

// src/__tests__/components/WalletConnection.test.jsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockWalletConnect } from '../../utils/testUtils';
import WalletConnection from '../../components/core/WalletConnection';

describe('WalletConnection Component', () => {
  it('shows connect button when wallet is not connected', () => {
    renderWithProviders(<WalletConnection />);
    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });

  it('handles wallet connection', async () => {
    const testAddress = '0x123...';
    const { store } = renderWithProviders(<WalletConnection />);

    // Mock the wallet connection
    await mockWalletConnect(testAddress);

    // Click connect button
    fireEvent.click(screen.getByText(/Connect Wallet/i));

    await waitFor(() => {
      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'account/setAccount',
          payload: { address: testAddress }
        })
      );
    });
  });

  it('shows error message when connection fails', async () => {
    const { store } = renderWithProviders(<WalletConnection />);

    // Mock a failed connection
    mockWalletConnect().mockRejectedValue(new Error('User rejected'));

    // Click connect button
    fireEvent.click(screen.getByText(/Connect Wallet/i));

    await waitFor(() => {
      expect(screen.getByText(/Failed to connect/i)).toBeInTheDocument();
    });
  });
});

