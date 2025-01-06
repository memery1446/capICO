import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TransactionHistory from '../components/TransactionHistory';

const mockStore = configureStore([]);

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: () => ({
          getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890')
        })
      }))
    },
    Contract: jest.fn(() => ({
      filters: {
        TokensPurchased: jest.fn()
      },
      queryFilter: jest.fn().mockResolvedValue([]),
      getBlock: jest.fn()
    })),
    utils: {
      formatEther: jest.fn(val => val.toString())
    }
  }
}));

describe('TransactionHistory', () => {
  beforeEach(() => {
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890'])
    };
  });

  it('should render initial state', async () => {
    const store = mockStore({
      ico: { transactionHistory: [] }
    });

    await act(async () => {
      render(
      <Provider store={store}>
        <TransactionHistory />
      </Provider>
    );
    });
    
    expect(screen.getByText(/Failed to fetch transaction history/)).toBeInTheDocument();
  });
});

