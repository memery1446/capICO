import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionHistory from '../components/TransactionHistory';

describe('TransactionHistory', () => {
  // Existing tests remain unchanged

  it('filters transactions by amount', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });
    fireEvent.click(refreshButton);

    const filterInput = screen.getByLabelText(/filter by min amount/i);
    
    // Initially, all transactions are visible
    expect(screen.getAllByTestId('transaction-item')).toHaveLength(3);

    // Filter for transactions with amount >= 150
    fireEvent.change(filterInput, { target: { value: '150' } });

    // Now, only two transactions should be visible
    expect(screen.getAllByTestId('transaction-item')).toHaveLength(2);
    expect(screen.getByText('Amount: 200 tokens')).toBeInTheDocument();
    expect(screen.getByText('Amount: 150 tokens')).toBeInTheDocument();
    expect(screen.queryByText('Amount: 100 tokens')).not.toBeInTheDocument();
  });

  it('combines filtering and sorting', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });
    fireEvent.click(refreshButton);

    const filterInput = screen.getByLabelText(/filter by min amount/i);
    const sortButton = screen.getByRole('button', { name: /sort by date/i });

    // Filter for transactions with amount >= 150
    fireEvent.change(filterInput, { target: { value: '150' } });

    // Sort oldest first
    fireEvent.click(sortButton);

    const transactionItems = screen.getAllByTestId('transaction-item');
    expect(transactionItems).toHaveLength(2);
    expect(transactionItems[0]).toHaveTextContent('Date: 2023-01-02 14:30:00');
    expect(transactionItems[1]).toHaveTextContent('Date: 2023-01-03 09:15:00');
  });

    it('displays "No transactions found" when no transactions match the filter', () => {
    render(<TransactionHistory />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh transactions/i });
    fireEvent.click(refreshButton);

    const filterInput = screen.getByLabelText(/filter by min amount/i);

    // Filter for transactions with amount >= 300 (which doesn't exist)
    fireEvent.change(filterInput, { target: { value: '300' } });

    expect(screen.getByTestId('no-transactions')).toBeInTheDocument();
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });
});

