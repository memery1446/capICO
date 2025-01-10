import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TokenVestingDashboard from '../components/TokenVestingDashboard';

jest.setTimeout(15000); // Increase timeout to 15 seconds for all tests in this file

const mockStore = configureStore([]);

// Mock the ethers library
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        })),
      })),
    },
    Contract: jest.fn(() => ({
      vestingSchedules: jest.fn().mockRejectedValue(new Error('Fetch error')),
      lockedTokens: jest.fn().mockRejectedValue(new Error('Fetch error')),
      icoStartTime: jest.fn().mockRejectedValue(new Error('Fetch error')),
    })),
    utils: {
      formatEther: jest.fn(val => (BigInt(val) / BigInt(1e18)).toString()),
    },
  },
}));

describe('TokenVestingDashboard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  it('displays error message when fetching fails', async () => {
    render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );

    expect(await screen.findByText('Failed to fetch vesting and lockup information. Please try again.')).toBeInTheDocument();
  });

  it('renders error message in red text', async () => {
    render(
      <Provider store={store}>
        <TokenVestingDashboard />
      </Provider>
    );

    const errorElement = await screen.findByText('Failed to fetch vesting and lockup information. Please try again.');
    expect(errorElement).toHaveClass('text-red-500');
  });

  // it('renders nested div elements with error message', async () => {
  //   render(
  //     <Provider store={store}>
  //       <TokenVestingDashboard />
  //     </Provider>
  //   );

  //   const outerDiv = await screen.findByRole('generic');
  //   expect(outerDiv).toBeInTheDocument();
    
  //   const innerDiv = outerDiv.firstChild;
  //   expect(innerDiv).toHaveClass('text-red-500');
  //   expect(innerDiv).toHaveTextContent('Failed to fetch vesting and lockup information. Please try again.');
  // });
});

