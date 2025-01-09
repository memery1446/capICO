import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserStatus from '../components/UserStatus';
import TierInfo from '../components/TierInfo';
import VestingInfo from '../components/VestingInfo';
import { ethers } from 'ethers';

jest.mock('ethers');

const mockStore = configureStore([]);

describe('User Status Update Integration', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      ico: {
        tokenBalance: '1000',
        tokenPrice: '0.1',
        vestingSchedule: {
          totalAmount: 1000000,
          releasedAmount: 250000,
          startTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 days ago
          duration: 365 * 24 * 60 * 60, // 1 year
          cliff: 90 * 24 * 60 * 60, // 90 days
        },
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    ethers.providers.Web3Provider.mockImplementation(() => ({
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      }),
    }));

    ethers.Contract.mockImplementation(() => ({
      whitelist: jest.fn().mockResolvedValue(true),
    }));
  });

  const renderComponents = (customStore = store) => {
    return render(
      <Provider store={customStore}>
        <UserStatus />
        <TierInfo getTiers={() => Promise.resolve([
          { minPurchase: '100', maxPurchase: '1000', discount: 5 },
          { minPurchase: '1001', maxPurchase: '5000', discount: 10 },
        ])} />
        <VestingInfo />
      </Provider>
    );
  };

  it('should display initial user status, tier info, and vesting schedule', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Your Status')).toBeInTheDocument();
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument();
      expect(screen.getByText('Whitelisted')).toBeInTheDocument();
      expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
      expect(screen.getByText('Your estimated total investment: 100.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Vesting Schedule')).toBeInTheDocument();
    });
  });

  it('should display correct vesting information', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Total Amount: 1000000 tokens')).toBeInTheDocument();
      expect(screen.getByText('Released Amount: 250000 tokens')).toBeInTheDocument();
      expect(screen.getByText(/Duration: 365 days/)).toBeInTheDocument();
      expect(screen.getByText(/Cliff: 90 days/)).toBeInTheDocument();
      expect(screen.getByText(/\d+\.\d+% Vested/)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    ethers.Contract.mockImplementationOnce(() => ({
      whitelist: jest.fn().mockRejectedValue(new Error('Contract error')),
    }));

    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to check whitelist status')).toBeInTheDocument();
    });
  });
});

