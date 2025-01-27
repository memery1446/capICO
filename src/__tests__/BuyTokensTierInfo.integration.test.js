import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([thunk]);

// Increase jest timeout for all tests in this file
jest.setTimeout(10000);

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

  it('renders initial state correctly', async () => {
    const mockGetTiers = jest.fn().mockResolvedValue([]);
    
    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment \(ETH\):/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders tier information correctly after loading', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '100', discount: '0' },
      { minPurchase: '100', maxPurchase: '500', discount: '5' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);

    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    // Wait for the first row to appear
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    }, { timeout: 6000 });

    // Now check the rest of the content
    expect(screen.getByText('0 - 100 ETH')).toBeInTheDocument();
    expect(screen.getByText('100 - 500 ETH')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('handles malformed tier data gracefully', async () => {
    const mockTiers = [
      { minPurchase: 'invalid', maxPurchase: '1', discount: '0' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    // Wait for the table to be populated
    await waitFor(() => {
      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody.children.length).toBeGreaterThan(0);
    }, { timeout: 6000 });
  });

  it('handles empty tier array correctly', async () => {
    const mockGetTiers = jest.fn().mockResolvedValue([]);
    
    await act(async () => {
      render(
        <Provider store={store}>
          <TierInfo getTiers={mockGetTiers} />
        </Provider>
      );
    });

    const table = screen.getByRole('table');
    const tbody = table.querySelector('tbody');
    expect(tbody).toBeEmptyDOMElement();
  });

  it('updates current tier when investment amount changes', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '100', discount: '0' },
      { minPurchase: '100', maxPurchase: '500', discount: '5' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('0 - 100 ETH')).toBeInTheDocument();
    });

    // Change investment amount
    const input = screen.getByLabelText(/Investment \(ETH\):/i);
    fireEvent.change(input, { target: { value: '200' } });

    // Should show Tier 2 info
    await waitFor(() => {
      const tierText = screen.getByText(/Current Tier: 2 \(5% discount\)/);
      expect(tierText).toBeInTheDocument();
    });
  });

  it('shows next tier benefits when between tiers', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '100', discount: '0' },
      { minPurchase: '100', maxPurchase: '500', discount: '5' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('0 - 100 ETH')).toBeInTheDocument();
    });

    // Set investment amount just below next tier
    const input = screen.getByLabelText(/Investment \(ETH\):/i);
    fireEvent.change(input, { target: { value: '50' } });

    // Should show next tier benefit information
    await waitFor(() => {
      expect(screen.getByText(/Next Tier Benefits/)).toBeInTheDocument();
      const benefitText = screen.getByText(/Invest .* more ETH to reach Tier 2/);
      expect(benefitText).toBeInTheDocument();
    });
  });

  it('displays the progress bar correctly', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '100', discount: '0' },
      { minPurchase: '100', maxPurchase: '500', discount: '5' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('0 - 100 ETH')).toBeInTheDocument();
    });

    // Set investment amount to halfway to next tier
    const input = screen.getByLabelText(/Investment \(ETH\):/i);
    fireEvent.change(input, { target: { value: '50' } });

    // Should show progress bar
    await waitFor(() => {
      // Find the container div by its class and containing elements
      const progressBarContainer = screen.getByText(/Current Tier:/)
        .closest('.mt-6')
        .querySelector('.bg-gray-200.rounded-full');
      const progressBar = progressBarContainer.querySelector('.bg-blue-500');
      expect(progressBar).toBeTruthy();
      expect(progressBar.style.width).toBe('50%');
    });
  });
});

