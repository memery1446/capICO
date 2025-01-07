import React from 'react';
import { render, screen } from '@testing-library/react';
import { ICOStatusDisplay } from '../components/ICOStatus';

describe('ICOStatusDisplay', () => {
  it('renders correctly with 50% progress', () => {
    const props = {
      totalRaised: '50',
      hardCap: '100',
      tokenName: 'Half Token',
      tokenSymbol: 'HALF'
    };

    render(<ICOStatusDisplay {...props} />);

    expect(screen.getByText('Total Raised:')).toBeInTheDocument();
    expect(screen.getByText('50 ETH')).toBeInTheDocument();
    expect(screen.getByText('Hard Cap:')).toBeInTheDocument();
    expect(screen.getByText('100 ETH')).toBeInTheDocument();
    expect(screen.getByText('Token:')).toBeInTheDocument();
    expect(screen.getByText('Half Token (HALF)')).toBeInTheDocument();

    const progressBar = screen.getByRole('progressbar', { name: 'ICO Progress' });
    expect(progressBar).toHaveStyle({ width: '50%' });
    expect(screen.getByTestId('progress-text')).toHaveTextContent('50.00% Raised');
  });

  it('renders correctly with 0% progress', () => {
    const props = {
      totalRaised: '0',
      hardCap: '100',
      tokenName: 'Zero Token',
      tokenSymbol: 'ZERO'
    };
    
    render(<ICOStatusDisplay {...props} />);
    
    expect(screen.getByText('Total Raised:')).toBeInTheDocument();
    expect(screen.getByText('0 ETH')).toBeInTheDocument();
    expect(screen.getByText('Hard Cap:')).toBeInTheDocument();
    expect(screen.getByText('100 ETH')).toBeInTheDocument();
    expect(screen.getByText('Token:')).toBeInTheDocument();
    expect(screen.getByText('Zero Token (ZERO)')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar', { name: 'ICO Progress' });
    expect(progressBar).toHaveStyle({ width: '0%' });
    expect(screen.getByTestId('progress-text')).toHaveTextContent('0.00% Raised');
  });

  it('renders correctly with 100% progress', () => {
    const props = {
      totalRaised: '100',
      hardCap: '100',
      tokenName: 'Full Token',
      tokenSymbol: 'FULL'
    };
    
    render(<ICOStatusDisplay {...props} />);
    
    expect(screen.getByText('Total Raised:')).toBeInTheDocument();
    expect(screen.getAllByText('100 ETH')).toHaveLength(2);
    expect(screen.getByText('Hard Cap:')).toBeInTheDocument();
    expect(screen.getByText('Token:')).toBeInTheDocument();
    expect(screen.getByText('Full Token (FULL)')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar', { name: 'ICO Progress' });
    expect(progressBar).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('progress-text')).toHaveTextContent('100.00% Raised');
  });

  it('renders the ICO Status title', () => {
  const props = {
    totalRaised: '50',
    hardCap: '100',
    tokenName: 'Test Token',
    tokenSymbol: 'TEST'
  };
  render(<ICOStatusDisplay {...props} />);
  expect(screen.getByText('ICO Status')).toBeInTheDocument();
});

  it('calculates and displays the correct progress percentage', () => {
  const props = {
    totalRaised: '75',
    hardCap: '150',
    tokenName: 'Test Token',
    tokenSymbol: 'TEST'
  };
  render(<ICOStatusDisplay {...props} />);
  expect(screen.getByTestId('progress-text')).toHaveTextContent('50.00% Raised');
});

  it('handles decimal values correctly', () => {
  const props = {
    totalRaised: '33.33',
    hardCap: '100',
    tokenName: 'Test Token',
    tokenSymbol: 'TEST'
  };
  render(<ICOStatusDisplay {...props} />);
  expect(screen.getByText('33.33 ETH')).toBeInTheDocument();
  expect(screen.getByTestId('progress-text')).toHaveTextContent('33.33% Raised');
});

  it('has proper accessibility attributes', () => {
  const props = {
    totalRaised: '50',
    hardCap: '100',
    tokenName: 'Test Token',
    tokenSymbol: 'TEST'
  };
  render(<ICOStatusDisplay {...props} />);
  const progressBar = screen.getByRole('progressbar', { name: 'ICO Progress' });
  expect(progressBar).toHaveAttribute('aria-label', 'ICO Progress');
});
});

