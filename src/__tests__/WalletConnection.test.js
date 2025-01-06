import React from 'react';
import { render, screen } from '@testing-library/react';
import OwnerActions from '../components/OwnerActions';

// Mock window.ethereum
const mockEthereum = {
  request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890'])
};

describe('OwnerActions', () => {
  beforeEach(() => {
    global.window.ethereum = mockEthereum;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic component elements', () => {
    render(<OwnerActions />);
    
    expect(screen.getByText('Owner Actions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter addresses to whitelist (comma-separated)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /whitelist addresses/i })).toBeInTheDocument();
  });

  it('displays toggle buttons with correct initial states', () => {
    render(<OwnerActions />);
    
    expect(screen.getByRole('button', { name: /pause ico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable cooldown/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disable vesting/i })).toBeInTheDocument();
  });
});