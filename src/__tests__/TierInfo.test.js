import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([]);

jest.mock('../contracts/addresses', () => ({
  ICO_ADDRESS: '0x1234567890123456789012345678901234567890'
}));

jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(),
    providers: {
      Web3Provider: jest.fn(),
    },
    utils: {
      parseEther: jest.fn(),
    },
  },
}));

describe('TierInfo', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenBalance: '1000',
        tokenPrice: '0.1',
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  it('renders loading state initially', async () => {
    const mockGetTiers = jest.fn().mockReturnValue(new Promise(() => {})); // Never resolves
    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading tier information...');
  });

  it('displays the Investment Tiers heading after loading', async () => {
    const mockGetTiers = jest.fn().mockResolvedValue([
      { minPurchase: '100', maxPurchase: '1000', discount: 5 },
    ]);
    
    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
  });

  it('correctly renders tier information', async () => {
    const mockTiers = [
      { minPurchase: '100', maxPurchase: '1000', discount: 5 },
      { minPurchase: '1001', maxPurchase: '5000', discount: 10 },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('tier-1')).toHaveTextContent('100');
    expect(screen.getByTestId('tier-1')).toHaveTextContent('1000');
    expect(screen.getByTestId('tier-1')).toHaveTextContent('5');
    expect(screen.getByTestId('tier-2')).toHaveTextContent('1001');
    expect(screen.getByTestId('tier-2')).toHaveTextContent('5000');
    expect(screen.getByTestId('tier-2')).toHaveTextContent('10');
  });

  it('calculates and displays correct user investment', async () => {
    const mockGetTiers = jest.fn().mockResolvedValue([
      { minPurchase: '100', maxPurchase: '1000', discount: 5 },
    ]);

    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-investment')).toHaveTextContent('Your estimated total investment: 100.0000 ETH');
  });

  it('determines and displays the correct current tier', async () => {
    const mockTiers = [
      { minPurchase: '50', maxPurchase: '500', discount: 5 },
      { minPurchase: '501', maxPurchase: '1000', discount: 10 },
      { minPurchase: '1001', maxPurchase: '5000', discount: 15 },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('current-tier')).toHaveTextContent('Your current tier: 1');
  });

  it('displays the correct next tier requirement', async () => {
    const mockTiers = [
      { minPurchase: '50', maxPurchase: '500', discount: 5 },
      { minPurchase: '501', maxPurchase: '1000', discount: 10 },
      { minPurchase: '1001', maxPurchase: '5000', discount: 15 },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('next-tier-requirement')).toHaveTextContent('Next tier requirement: 501 ETH');
  });

  it('displays "Max tier reached" when user is at the highest tier', async () => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenBalance: '50000', // Increase this to ensure it's in the highest tier
        tokenPrice: '0.1',
      },
    });

    const mockTiers = [
      { minPurchase: '50', maxPurchase: '500', discount: 5 },
      { minPurchase: '501', maxPurchase: '1000', discount: 10 },
      { minPurchase: '1001', maxPurchase: '5000', discount: 15 },
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('next-tier-requirement')).toHaveTextContent('Next tier requirement: Max tier reached');
  });
});

