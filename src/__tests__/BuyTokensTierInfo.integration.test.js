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
    const mockGetTiers = jest.fn(() => new Promise(() => {}));
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
    });
  });

  it('handles malformed tier data correctly', async () => {
    const mockTiers = [
      { minPurchase: 'invalid', maxPurchase: '1', discount: '0' },
      { minPurchase: '1', maxPurchase: null, discount: '5' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading tier information...')).not.toBeInTheDocument();
    });
  });

  it('matches snapshot for loaded state', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '1', discount: '0' }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    const { container } = render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tier information...')).not.toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });
// it('handles API errors gracefully', async () => {
//   const mockGetTiers = jest.fn().mockRejectedValue(new Error('Failed to fetch tiers'));
//   render(
//     <Provider store={store}>
//       <TierInfo getTiers={mockGetTiers} />
//     </Provider>
//   );
  
//   await waitFor(() => {
//     expect(screen.getByText(/Error fetching tiers/i)).toBeInTheDocument();
//   });
//});
  // ... rest of your existing tests ...
});
