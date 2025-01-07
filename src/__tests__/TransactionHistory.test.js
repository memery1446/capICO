import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionHistory from '../components/TransactionHistory';

describe('TransactionHistory', () => {
  it('renders the component with no transactions initially', () => {
    render(<TransactionHistory />);
    
    expect(screen.getByTestId('transaction-history')).toBeInTheDocument();
    expect(screen.getByText('Your Transaction History')).toBeInTheDocument();
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument();
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });

  it('displays a refresh button', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('toggles between no transactions and transactions when refresh is clicked', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });

    // Initially, no transactions
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument();

    // Click refresh
    fireEvent.click(refreshButton);

    // Now, transactions should be visible
    expect(screen.getAllByTestId('transaction-item')).toHaveLength(3);
    expect(screen.getByText('Amount: 100 tokens')).toBeInTheDocument();
    expect(screen.getByText('Date: 2023-01-01 12:00:00')).toBeInTheDocument();

    // Click refresh again
    fireEvent.click(refreshButton);

    // Back to no transactions
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument();
  });

  it('sorts transactions when sort button is clicked', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });
    fireEvent.click(refreshButton);

    const sortButton = screen.getByRole('button', { name: /sort by date/i });
    
    // Initially, newest first
    let dates = screen.getAllByText(/Date:/).map(el => el.textContent);
    expect(dates).toEqual([
      'Date: 2023-01-03 09:15:00',
      'Date: 2023-01-02 14:30:00',
      'Date: 2023-01-01 12:00:00'
    ]);

    // Click sort
    fireEvent.click(sortButton);

    // Now, oldest first
    dates = screen.getAllByText(/Date:/).map(el => el.textContent);
    expect(dates).toEqual([
      'Date: 2023-01-01 12:00:00',
      'Date: 2023-01-02 14:30:00',
      'Date: 2023-01-03 09:15:00'
    ]);
  });
});

