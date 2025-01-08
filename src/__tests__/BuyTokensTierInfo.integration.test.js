import React from 'react';
import { render, screen } from '@testing-library/react';
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
});

