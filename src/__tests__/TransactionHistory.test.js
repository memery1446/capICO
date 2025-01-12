import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TransactionHistory from '../components/TransactionHistory';

jest.setTimeout(10000);

const mockEthersService = {
  _service: {
    getSignerAddress: jest.fn().mockResolvedValue('0x123'),
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

// Mock withEthers HOC
jest.mock('../withEthers', () => ({
  withEthers: (Component) => (props) => <Component {...props} ethersService={mockEthersService} />
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

    mockEthersService._service.icoContract.queryFilter.mockResolvedValue([]);
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

  // it('displays transaction data correctly', async () => {
  //   // Setup mock data with exact values we expect
  //   const timestamp = new Date('2024-01-01T12:00:00Z').getTime() / 1000;
  //   const mockEvent = {
  //     transactionHash: '0x123',
  //     args: {
  //       amount: '1000000000000000000', // 1 ETH
  //       tokens: '10000000000000000000' // 10 tokens
  //     },
  //     blockNumber: 1
  //   };

  //   mockEthersService._service.icoContract.queryFilter.mockResolvedValueOnce([mockEvent]);
  //   mockEthersService._service.provider.getBlock.mockResolvedValueOnce({ timestamp });

  //   await act(async () => {
  //     render(
  //       <Provider store={store}>
  //         <TransactionHistory />
  //       </Provider>
  //     );
  //   });

  //   // Wait for table to render
  //   await waitFor(() => {
  //     expect(screen.getByRole('table')).toBeInTheDocument();
  //   });

  //   // Look for cells containing the formatted numbers
  //   const cells = screen.getAllByRole('cell');
  //   expect(cells.some(cell => cell.textContent === '1.0')).toBe(true);
  //   expect(cells.some(cell => cell.textContent === '10.0')).toBe(true);
  // });

  it('handles refresh button click', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <TransactionHistory />
        </Provider>
      );
    });

    // Let initial render complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh transactions/i })).toBeInTheDocument();
    });

    const queryFilterSpy = jest.spyOn(mockEthersService._service.icoContract, 'queryFilter');
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /refresh transactions/i }));
    });

    expect(queryFilterSpy).toHaveBeenCalled();
  });

  // it('shows loading state initially', async () => {
  //   // Mock slow response
  //   mockEthersService._service.getSignerAddress.mockImplementationOnce(
  //     () => new Promise(resolve => setTimeout(() => resolve('0x123'), 100))
  //   );

  //   let rendered;
  //   await act(async () => {
  //     rendered = render(
  //       <Provider store={store}>
  //         <TransactionHistory />
  //       </Provider>
  //     );
  //   });

  //   // Check initial loading div
  //   expect(screen.getByText('Loading transaction history...')).toBeInTheDocument();

  //   // Wait for loading to finish to clean up the test
  //   await waitFor(() => {
  //     expect(screen.queryByText('Loading transaction history...')).not.toBeInTheDocument();
  //   });
  // });
});

