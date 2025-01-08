import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([thunk]);

jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(() => ({
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 }),
      buyTokens: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue(true) }),
      balanceOf: jest.fn().mockResolvedValue({ toString: () => '1000000000000000000' }),
    })),
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        })),
      })),
    },
    utils: {
      parseEther: jest.fn(val => val),
    },
  },
}));

describe('TierInfo Integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '10',
        maxPurchaseAmount: '10',
      },
    });
  });

  it('renders loading state correctly', () => {
    const mockGetTiers = jest.fn(() => new Promise(() => {})); // This promise never resolves
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    expect(screen.getByText('Loading tier information...')).toBeInTheDocument();
  });

  it('renders tier information correctly after loading', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: '5', discount: '5' },
      { minPurchase: '5', maxPurchase: '10', discount: '10' },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
      expect(screen.getByText('Your estimated total investment: 1.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Your current tier: 2')).toBeInTheDocument();
    });

    mockTiers.forEach((tier, index) => {
      expect(screen.getByTestId(`tier-${index + 1}`)).toBeInTheDocument();
    });
  });

  it('calculates current tier correctly based on user investment', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: '5', discount: '5' },
      { minPurchase: '5', maxPurchase: '10', discount: '10' },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    const highInvestmentStore = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '100', // 10 ETH worth of tokens
        maxPurchaseAmount: '10',
      },
    });

    render(
      <Provider store={highInvestmentStore}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your estimated total investment: 10.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Your current tier: 3')).toBeInTheDocument();
      expect(screen.getByText('Next tier requirement: Max tier reached')).toBeInTheDocument();
    });
  });

  it('updates tier information when token balance changes', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: '5', discount: '5' },
      { minPurchase: '5', maxPurchase: '10', discount: '10' },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    const { rerender } = render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your estimated total investment: 1.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Your current tier: 2')).toBeInTheDocument();
    });

    const updatedStore = mockStore({
      ico: {
        ...store.getState().ico,
        tokenBalance: '50', // 5 ETH worth of tokens
      },
    });

    rerender(
      <Provider store={updatedStore}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your estimated total investment: 5.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Your current tier: 3')).toBeInTheDocument();
    });
  });

  it('displays correct tier information', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: '5', discount: '5' },
      { minPurchase: '5', maxPurchase: '10', discount: '10' },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading tier information...')).not.toBeInTheDocument();
    }, { timeout: 6000 });

    for (let i = 0; i < mockTiers.length; i++) {
      const tierElement = await screen.findByTestId(`tier-${i + 1}`, {}, { timeout: 6000 });
      expect(tierElement).toHaveTextContent(mockTiers[i].minPurchase);
      expect(tierElement).toHaveTextContent(mockTiers[i].maxPurchase);
      expect(tierElement).toHaveTextContent(mockTiers[i].discount);
    }

    // Check for the current tier
    expect(screen.getByTestId('current-tier')).toHaveTextContent('Your current tier: 2');

    // Check for the next tier requirement
    expect(screen.getByTestId('next-tier-requirement')).toHaveTextContent('Next tier requirement: 5 ETH');
  }, 10000);

  it('handles edge case of zero investment correctly', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: '5', discount: '5' },
      { minPurchase: '5', maxPurchase: '10', discount: '10' },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    const zeroInvestmentStore = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '0',
        maxPurchaseAmount: '10',
      },
    });

    render(
      <Provider store={zeroInvestmentStore}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your estimated total investment: 0.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Your current tier: 1')).toBeInTheDocument();
      expect(screen.getByText('Next tier requirement: 1 ETH')).toBeInTheDocument();
    });

    const firstTierElement = await screen.findByTestId('tier-1');
    expect(firstTierElement).toHaveTextContent('Current');
  }, 10000);

  it('displays correct tier status for each tier', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: '5', discount: '5' },
      { minPurchase: '5', maxPurchase: '10', discount: '10' },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    const midInvestmentStore = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '30', // 3 ETH worth of tokens
        maxPurchaseAmount: '10',
      },
    });

    render(
      <Provider store={midInvestmentStore}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your estimated total investment: 3.0000 ETH')).toBeInTheDocument();
      expect(screen.getByText('Your current tier: 2')).toBeInTheDocument();
    });

    const tier1Element = await screen.findByTestId('tier-1');
    const tier2Element = await screen.findByTestId('tier-2');
    const tier3Element = await screen.findByTestId('tier-3');

    expect(tier1Element).toHaveTextContent('Achieved');
    expect(tier2Element).toHaveTextContent('Current');
    expect(tier3Element).toHaveTextContent('Not Reached');
  }, 10000);
});

