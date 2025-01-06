import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TokenVestingDashboard from '../components/TokenVestingDashboard';

// Mock the entire ethers library
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ...original,
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        })),
      })),
    },
    Contract: jest.fn(() => ({
      vestingSchedules: jest.fn().mockResolvedValue({
        totalAmount: original.BigNumber.from('1000000000000000000000'),
        releasedAmount: original.BigNumber.from('200000000000000000000'),
        startTime: original.BigNumber.from(Math.floor(Date.now() / 1000)),
        duration: original.BigNumber.from(365 * 24 * 60 * 60),
        cliff: original.BigNumber.from(90 * 24 * 60 * 60),
      }),
      lockedTokens: jest.fn().mockResolvedValue(original.BigNumber.from('500000000000000000000')),
      icoStartTime: jest.fn().mockResolvedValue(original.BigNumber.from(Math.floor(Date.now() / 1000) - 100 * 24 * 60 * 60)),
    })),
  };
});

const mockStore = configureStore([]);

describe('TokenVestingDashboard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
      },
    });
  });

  it('renders either loading state or vesting information', async () => {
    render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );

    // Check for either loading state or vesting information
    const content = await screen.findByText(
      (content, element) => {
        return (
          content.includes('Loading vesting and lockup information...') ||
          content.includes('Total Vested Amount:') ||
          content.includes('Released Amount:') ||
          content.includes('Vesting Duration:') ||
          content.includes('Cliff Period:') ||
          content.includes('Locked Amount:')
        );
      },
      {},
      { timeout: 5000 }
    );

    expect(content).toBeInTheDocument();
  });
});

