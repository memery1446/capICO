import React from 'react';
import { render, screen } from '@testing-library/react';
import { ICOStatusDisplay } from '../components/ICOStatus';

describe('ICOStatusDisplay', () => {
  const defaultProps = {
    totalRaised: '50',
    hardCap: '100',
    tokenName: 'Test Token',
    tokenSymbol: 'TEST'
  };

  it('renders basic ICO information', () => {
    render(<ICOStatusDisplay {...defaultProps} />);

    expect(screen.getByText('ICO Status')).toBeInTheDocument();
    expect(screen.getByText(/50 ETH/)).toBeInTheDocument();
    expect(screen.getByText(/100 ETH/)).toBeInTheDocument();
  });

  it('displays progress bar correctly', () => {
    render(<ICOStatusDisplay {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar', { name: 'ICO Progress' });
    expect(progressBar).toHaveStyle({ width: '50%' });
    expect(screen.getByTestId('progress-text')).toHaveTextContent('50.00% Raised');
  });
});