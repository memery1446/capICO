import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([]);

jest.mock('../contracts/addresses', () => ({
  ICO_ADDRESS: '0x1234567890123456789012345678901234567890'
}));

// Mock the entire ethers library
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
});

