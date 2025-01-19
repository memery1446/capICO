import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WalletConnection from '../components/WalletConnection';
import ReferralSystem from '../components/ReferralSystem';
import { setWalletConnection, resetReferralState } from '../store/referralSlice';
import { ethers } from 'ethers';

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  const mockContract = {
    referralBonuses: jest.fn().mockResolvedValue(originalModule.BigNumber.from('10000000000000000000')),
    referrers: jest.fn().mockResolvedValue('0x9876543210987654321098765432109876543210'),
    setReferrer: jest.fn().mockResolvedValue(true),
  };
  return {
    ...originalModule,
    Contract: jest.fn(() => mockContract),
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        })),
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }), // Added missing mock
      })),
    },
  };
});

const mockStore = configureStore([thunk]);

describe('WalletConnection and ReferralSystem Interaction', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      referral: {
        isWalletConnected: false,
        referralBonus: '0',
        currentReferrer: '',
      },
      ico: {
        tokenSymbol: 'TEST',
      },
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

it('updates ReferralSystem when wallet is connected', async () => {
    // First update the store to simulate connected wallet state
    store = mockStore({
      referral: {
        isWalletConnected: true,
        referralBonus: '0',
        currentReferrer: '',
      },
      ico: {
        tokenSymbol: 'TEST'
      }
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
          <ReferralSystem ethersService={{
            getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
            getReferralBonus: jest.fn().mockResolvedValue('10'),
            getCurrentReferrer: jest.fn().mockResolvedValue('0x9876...')
          }} />
        </Provider>
      );
    });

    // First verify referral system is visible
    expect(screen.getByText('Referral System')).toBeInTheDocument();
    
    // Wait for network info to load
    await waitFor(() => {
      expect(screen.getByText(/Network:/)).toBeInTheDocument();
    });
});

it('handles invalid referrer addresses correctly', async () => {
    // Update store to simulate connected wallet state
    store = mockStore({
      referral: {
        isWalletConnected: true,  // This is the key change
        referralBonus: '0',
        currentReferrer: '',
      },
      ico: {
        tokenSymbol: 'TEST'
      }
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ReferralSystem ethersService={{
            getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
            getReferralBonus: jest.fn().mockResolvedValue('10'),
            getCurrentReferrer: jest.fn().mockResolvedValue(''),
            setReferrer: jest.fn().mockRejectedValue(new Error('Invalid address'))
          }} />
        </Provider>
      );
    });

    const input = screen.getByPlaceholderText('Enter referrer address');
    fireEvent.change(input, { target: { value: 'invalid-address' } });
    fireEvent.click(screen.getByText('Set Referrer'));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid address')).toBeInTheDocument();
    });
});


});

