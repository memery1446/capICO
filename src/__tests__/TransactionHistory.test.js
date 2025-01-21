import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TransactionHistory from '../components/TransactionHistory';
import { ethers } from 'ethers';

jest.setTimeout(10000);

const mockEthersService = {
  _service: {
    getSignerAddress: jest.fn().mockResolvedValue('0x123'),
    queryTransactionEvents: jest.fn().mockResolvedValue([]),
    getBlock: jest.fn().mockResolvedValue({ timestamp: Date.now() / 1000 }),
    icoContract: {
      filters: {
        TokensPurchased: jest.fn().mockReturnValue({})
      },
      queryFilter: jest.fn().mockResolvedValue([])
    },
    provider: {
      getBlock: jest.fn().mockResolvedValue({ timestamp: Date.now() / 1000 })
    }
  }
};

jest.mock('../withEthers', () => ({
  withEthers: (Component) => (props) => <Component {...props} ethersService={mockEthersService} />
}));

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      formatEther: (value) => {
        // Simple mock to handle common test values
        if (value === '1000000000000000000') return '1.0';
        if (value === '10000000000000000000') return '10.0';
        return '0.0';
      }
    }
  }
}));

const mockStore = configureStore([]);

describe('TransactionHistory', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    
    store = mockStore({
      referral: {
        isWalletConnected: true
      }
    });

    mockEthersService._service.queryTransactionEvents.mockResolvedValue([]);
    mockEthersService._service.getSignerAddress.mockResolvedValue('0x123');
  });

  it('displays empty state when no transactions exist', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <TransactionHistory />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  it('displays transaction data correctly', async () => {
    const mockTransaction = {
      transactionHash: '0x123',
      args: {
        amount: '1000000000000000000', // 1 ETH
        tokens: '10000000000000000000' // 10 tokens
      },
      blockNumber: 1
    };

    const mockBlockTimestamp = Math.floor(new Date('2024-01-01T12:00:00Z').getTime() / 1000);
    
    mockEthersService._service.queryTransactionEvents.mockResolvedValueOnce([mockTransaction]);
    mockEthersService._service.getBlock.mockResolvedValueOnce({ 
      timestamp: mockBlockTimestamp 
    });

    render(
      <Provider store={store}>
        <TransactionHistory />
      </Provider>
    );

    // Wait for the table and verify its contents
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Amount (ETH)')).toBeInTheDocument();
    expect(screen.getByText('Tokens')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();

    // Check transaction values
    await waitFor(() => {
      const cells = screen.getAllByRole('cell');
      const dateCell = cells[0];
      const amountCell = cells[1];
      const tokensCell = cells[2];

      expect(dateCell).toHaveTextContent(new Date(mockBlockTimestamp * 1000).toLocaleString());
      expect(amountCell).toHaveTextContent('1.0');
      expect(tokensCell).toHaveTextContent('10.0');
    });
  });

  it('handles refresh button click', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <TransactionHistory />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh transactions/i })).toBeInTheDocument();
    });

    const queryTransactionsSpy = jest.spyOn(mockEthersService._service, 'queryTransactionEvents');
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /refresh transactions/i }));
    });

    expect(queryTransactionsSpy).toHaveBeenCalled();
  });

  it('shows and removes loading state correctly', async () => {
    // Create controlled promises for both address and transaction loading
    let resolveAddress, resolveQuery;
    const addressPromise = new Promise(resolve => {
      resolveAddress = resolve;
    });
    const queryPromise = new Promise(resolve => {
      resolveQuery = resolve;
    });

    // Mock the async calls to control loading state
    mockEthersService._service.getSignerAddress.mockImplementationOnce(() => addressPromise);
    mockEthersService._service.queryTransactionEvents.mockImplementationOnce(() => queryPromise);

    await act(async () => {
      render(
        <Provider store={store}>
          <TransactionHistory />
        </Provider>
      );
    });

    // Resolve address to trigger transaction loading
    await act(async () => {
      resolveAddress('0x123');
    });

    // Now we should see loading state
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    // Resolve transaction loading
    await act(async () => {
      resolveQuery([]);
    });

    // Loading should be replaced with empty state
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  it('handles wallet connection state', () => {
    store = mockStore({
      referral: {
        isWalletConnected: false
      }
    });

    render(
      <Provider store={store}>
        <TransactionHistory />
      </Provider>
    );

    expect(screen.getByText('Please connect your wallet to view transaction history.')).toBeInTheDocument();
  });
});

