import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import WhitelistStatus from '../components/WhitelistStatus';

// Mock the entire ethers library
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn(() => Promise.resolve('0x1234567890123456789012345678901234567890')),
        })),
      })),
    },
    Contract: jest.fn(() => ({
      whitelist: jest.fn(() => Promise.resolve(true)),
    })),
  },
}));

const mockStore = configureStore([thunk]);

// Create a real Redux store for the last test
const realStore = createStore(
  combineReducers({
    ico: (state = { isWhitelisted: false }, action) => {
      switch (action.type) {
        case 'ico/setWhitelistStatus':
          return { ...state, isWhitelisted: action.payload };
        default:
          return state;
      }
    },
  }),
  { ico: { isWhitelisted: false } }
);

describe('WhitelistStatus', () => {
  let store;
  let originalError;
  let originalEthereum;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isWhitelisted: false,
      },
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
    };

    // Suppress console.error for cleaner test output
    originalError = console.error;
    console.error = jest.fn();

    // Store the original ethereum object
    originalEthereum = global.window.ethereum;
  });

  afterEach(() => {
    console.error = originalError;
    global.window.ethereum = originalEthereum;
    jest.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('updates the whitelist status when the state changes', () => {
    const { rerender } = render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();

    // Update the store with a new state
    store = mockStore({
      ico: {
        isWhitelisted: true,
      },
    });

    // Re-render the component with the updated store
    rerender(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('You are whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('handles error when checking whitelist status', async () => {
    // Mock the ethers Contract to throw an error
    jest.spyOn(require('ethers').ethers, 'Contract').mockImplementationOnce(() => ({
      whitelist: jest.fn().mockRejectedValue(new Error('Failed to check whitelist status')),
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <WhitelistStatus />
        </Provider>
      );
    });

    // Verify that the component still renders without crashing
    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();

    // Check if console.error was called with the expected error message
    expect(console.error).toHaveBeenCalledWith('Error checking whitelist status:', expect.any(Error));
  });

  it('handles absence of ethereum object', () => {
    // Remove the ethereum object to simulate absence of Web3 provider
    delete global.window.ethereum;

    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    // Verify that the component still renders without crashing
    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();

    // Check if console.error was not called
    expect(console.error).not.toHaveBeenCalled();
  });

  it('updates display when whitelist status is checked successfully', async () => {
    // Use the real Redux store for this test
    await act(async () => {
      render(
        <Provider store={realStore}>
          <WhitelistStatus />
        </Provider>
      );
    });

    // Dispatch the action to update the store
    await act(async () => {
      realStore.dispatch({ type: 'ico/setWhitelistStatus', payload: true });
    });

    // Use waitFor to allow time for the component to update
    await waitFor(() => {
      expect(screen.getByText('You are whitelisted for this ICO.')).toBeInTheDocument();
    });
  });
});

