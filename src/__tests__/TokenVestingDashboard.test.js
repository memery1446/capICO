import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TokenVestingDashboard from '../components/TokenVestingDashboard';

const mockStore = configureStore([]);

// Mock the entire ethers library
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        })),
      })),
    },
    Contract: jest.fn(() => ({})),
  },
}));

describe('TokenVestingDashboard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
      },
    });
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );
    // Check if the error message is displayed
    expect(screen.getByText(/Failed to fetch vesting and lockup information/)).toBeInTheDocument();
  });
});

