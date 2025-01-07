import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([]);

jest.mock('../contracts/addresses', () => ({
  ICO_ADDRESS: '0x1234567890123456789012345678901234567890'
}));

// Mock the entire ethers library
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

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );
    // If the component renders without throwing an error, this test will pass
  });
});

