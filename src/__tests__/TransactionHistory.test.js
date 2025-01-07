import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TransactionHistory from '../components/TransactionHistory';

// Mock the ethers library
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        })),
      })),
    },
    Contract: jest.fn(() => ({
      filters: {
        TokensPurchased: jest.fn().mockReturnValue({}),
      },
      queryFilter: jest.fn().mockResolvedValue([]),
    })),
    utils: {
      formatEther: jest.fn(val => val.toString()),
    },
  },
}));

const mockStore = configureStore([thunk]);

describe('TransactionHistory', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders error state when there is an issue with ethers', async () => {
    render(
      <Provider store={store}>
        <TransactionHistory />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    expect(screen.getByText(/provider.getSigner is not a function/)).toBeInTheDocument();
  });
});

