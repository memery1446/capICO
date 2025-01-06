import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

// Mock ethers
jest.mock('ethers', () => {
  return {
    ethers: {
      providers: {
        Web3Provider: jest.fn(() => ({
          getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }),
          getSigner: jest.fn(() => ({
            getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          })),
        })),
      },
      Contract: jest.fn(() => ({
        getTierCount: jest.fn().mockResolvedValue(3),
        getTier: jest.fn().mockImplementation((index) => {
          const tiers = [
            ['100000000000000000000', '1000000000000000000000', 5],
            ['1000000000000000000000', '5000000000000000000000', 10],
            ['5000000000000000000000', '10000000000000000000000', 15],
          ];
          return Promise.resolve(tiers[index]);
        }),
      })),
      utils: {
        formatEther: jest.fn(val => (Number(val) / 1e18).toString()),
      },
    },
  };
});

const mockStore = configureStore([]);

describe('TierInfo', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenBalance: '1000000000000000000000', // 1000 tokens in Wei
        tokenPrice: '100000000000000000', // 0.1 ETH in Wei
      },
    });

    // Mock window.ethereum
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      isMetaMask: true,
    };
  });

  it('renders TierInfo component with correct headings', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
      expect(screen.getByText(/Your estimated total investment:/)).toBeInTheDocument();
    });
  });

  it('renders the tier table with correct headers', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tier')).toBeInTheDocument();
      expect(screen.getByText('Min Purchase (ETH)')).toBeInTheDocument();
      expect(screen.getByText('Max Purchase (ETH)')).toBeInTheDocument();
      expect(screen.getByText('Discount (%)')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  it('displays current tier and next tier requirement text', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Your current tier:/)).toBeInTheDocument();
      expect(screen.getByText(/Next tier requirement:/)).toBeInTheDocument();
    });
  });

  it('renders the investment tiers table with correct structure', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      // Check for the presence of key elements
      expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
      expect(screen.getByText(/Your estimated total investment:/)).toBeInTheDocument();

      // Check for table headers
      expect(screen.getByText('Tier')).toBeInTheDocument();
      expect(screen.getByText('Min Purchase (ETH)')).toBeInTheDocument();
      expect(screen.getByText('Max Purchase (ETH)')).toBeInTheDocument();
      expect(screen.getByText('Discount (%)')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();

      // Check for current tier and next tier requirement text
      expect(screen.getByText(/Your current tier:/)).toBeInTheDocument();
      expect(screen.getByText(/Next tier requirement:/)).toBeInTheDocument();

      // Check that the table body is present (even if empty)
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
    });
  });
});

