import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TokenVestingDashboard from '../components/TokenVestingDashboard';
import VestingInfo from '../components/VestingInfo';
import WalletConnection from '../components/WalletConnection';

const mockStore = configureStore([thunk]);

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  const mockContract = {
    vestingSchedules: jest.fn().mockResolvedValue({
      totalAmount: '1000000',
      releasedAmount: '250000',
      startTime: Math.floor(Date.now() / 1000),
      duration: 365 * 24 * 60 * 60,
      cliff: 90 * 24 * 60 * 60
    }),
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

describe('Vesting Flow Integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        vestingSchedule: null,
      },
      wallet: {
        connected: false,
        address: null
      },
      referral: {
        isWalletConnected: false
      }
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  // it('updates VestingInfo when wallet is connected', async () => {
  //   await act(async () => {
  //     render(
  //       <Provider store={store}>
  //         <WalletConnection />
  //         <VestingInfo />
  //       </Provider>
  //     );
  //   });

  //   expect(screen.getByText('No vesting schedule available.')).toBeInTheDocument();

  //   await act(async () => {
  //     fireEvent.click(screen.getByText('Connect Wallet'));
  //   });

  //   const actions = store.getActions();
  //   expect(actions).toContainEqual(expect.objectContaining({
  //     type: expect.stringMatching(/setWalletConnection/i)
  //   }));


  // });
  it('maintains correct state across components', async () => {
  // Verify WalletConnection, VestingInfo, and TokenVestingDashboard  
  // all reflect same wallet/vesting state
});
it('handles failed claim attempts correctly', async () => {
  // Mock transaction failure
  // Verify error display
  // Check state reverts correctly
});
it('handles token release interaction', async () => {
  // Mock successful release transaction
  // Verify button enables after cliff period
  // Verify UI updates after release
  // Check new balance reflected
});



});


