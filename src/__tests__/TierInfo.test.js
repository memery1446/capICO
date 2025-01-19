import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([]);

jest.mock('../contracts/addresses', () => ({
  ICO_ADDRESS: '0x1234567890123456789012345678901234567890'
}));

jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(),
    providers: {
      Web3Provider: jest.fn(),
    },
    utils: {
      parseEther: jest.fn(),
    },
  },
}));

describe('TierInfo', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenBalance: '1000',
        tokenPrice: '0.1',
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

it('renders initial component structure correctly', async () => {
  const mockGetTiers = jest.fn().mockResolvedValue([]);
  
  render(
    <Provider store={store}>
      <TierInfo getTiers={mockGetTiers} />
    </Provider>
  );

  expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
  expect(screen.getByLabelText(/Investment \(ETH\):/i)).toBeInTheDocument();
  expect(screen.getByText('Tier')).toBeInTheDocument();
  expect(screen.getByText('Investment Range (ETH)')).toBeInTheDocument();
  expect(screen.getByText('Discount')).toBeInTheDocument();
});


  it('renders tier table rows when tiers are provided', async () => {
    const mockTiers = [
      { minPurchase: '0', maxPurchase: '100', discount: 0 },
      { minPurchase: '100', maxPurchase: '500', discount: 5 }
    ];
    const mockGetTiers = jest.fn().mockResolvedValue(mockTiers);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('0 - 100 ETH')).toBeInTheDocument();
    });
    
    expect(screen.getByText('100 - 500 ETH')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('handles investment input changes', () => {
    const mockGetTiers = jest.fn().mockResolvedValue([]);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    const input = screen.getByLabelText(/Investment \(ETH\):/i);
    expect(input.value).toBe('0');

    fireEvent.change(input, { target: { value: '100' } });
    expect(input.value).toBe('100');
  });

  it('shows empty table body when no tiers are available', async () => {
    const mockGetTiers = jest.fn().mockResolvedValue([]);
    
    render(
      <Provider store={store}>
        <TierInfo getTiers={mockGetTiers} />
      </Provider>
    );

    const table = screen.getByRole('table');
    const tbody = table.querySelector('tbody');
    expect(tbody).toBeEmptyDOMElement();
  });
});

