import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TokenVestingDashboard from '../components/TokenVestingDashboard';

const mockStore = configureStore([]);

// Ethers mock
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn()
        }))
      }))
    },
    Contract: jest.fn(),
    utils: {
      formatEther: jest.fn()
    }
  }
}));

// Mock contract imports
jest.mock('../contracts/addresses', () => ({
  ICO_ADDRESS: '0x1234'
}));

jest.mock('../contracts/CapICO.json', () => ({
  abi: []
}));

describe('TokenVestingDashboard', () => {
  beforeEach(() => {
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(true)
    };
  });

  it('renders error state with correct styling', () => {
    const store = mockStore({
      ico: {
        tokenSymbol: 'TEST'
      }
    });

    const { container } = render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );

    // Test the error message container styling
    const errorDiv = container.querySelector('.bg-red-50');
    expect(errorDiv).toBeInTheDocument();
    expect(errorDiv).toHaveClass('text-red-500', 'bg-red-50');
    expect(errorDiv).toHaveTextContent('Failed to fetch vesting and lockup information. Please try again.');
  });

  it('displays correct layout classes', () => {
    const store = mockStore({
      ico: {
        tokenSymbol: 'TEST'
      }
    });

    const { container } = render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );

    // Verify the main container classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass(
      'bg-white',
      'p-6',
      'rounded-lg',
      'shadow-md'
    );
  });

  it('applies correct error message styling', () => {
    const store = mockStore({
      ico: {
        tokenSymbol: 'TEST'
      }
    });

    const { container } = render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );

    // Test additional error styling details
    const errorDiv = container.querySelector('.text-red-500');
    expect(errorDiv).toHaveClass(
      'text-red-500',
      'p-4',
      'rounded-md',
      'bg-red-50'
    );
  });

});

  

  