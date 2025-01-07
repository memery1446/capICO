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

  it('toggles between no transactions and a transaction when refresh is clicked', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });

    // Initially, no transactions
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument();

    // Click refresh
    fireEvent.click(refreshButton);

    // Now, a transaction should be visible
    expect(screen.getByTestId('transaction-item')).toBeInTheDocument();
    expect(screen.getByText('Amount: 100 tokens')).toBeInTheDocument();
    expect(screen.getByText('Date: 2023-01-01 12:00:00')).toBeInTheDocument();

    // Click refresh again
    fireEvent.click(refreshButton);

    // Back to no transactions
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument();
  });
});

