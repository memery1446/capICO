import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }),
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
    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
          <ReferralSystem />
        </Provider>
      );
    });

    expect(screen.getByText('Please connect your wallet to view and interact with the referral system.')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Connect Wallet'));
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(setWalletConnection(true));

    store = mockStore({
      referral: {
        isWalletConnected: true,
        referralBonus: '10',
        currentReferrer: '0x9876543210987654321098765432109876543210',
      },
      ico: {
        tokenSymbol: 'TEST',
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WalletConnection />
          <ReferralSystem />
        </Provider>
      );
    });

    expect(screen.getByText('Your Referral Bonus: 10 TEST')).toBeInTheDocument();
    expect(screen.getByText('Current Referrer: 0x9876543210987654321098765432109876543210')).toBeInTheDocument();
  });
});

