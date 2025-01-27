import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import WhitelistStatus from '../components/WhitelistStatus';

const mockStore = configureStore([]);

// Mock ethers
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
      whitelist: jest.fn().mockResolvedValue(true),
    })),
  },
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

describe('WhitelistStatus', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isWhitelisted: false,
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('renders the component with initial not whitelisted state', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <WhitelistStatus />
        </Provider>
      );
    });

    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('renders the component with whitelisted state', async () => {
    store = mockStore({
      ico: {
        isWhitelisted: true,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <WhitelistStatus />
        </Provider>
      );
    });

    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('updates the component when whitelist status changes', async () => {
    const { rerender } = render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    await act(async () => {
      await screen.findByText('You are not whitelisted for this ICO.');
    });

    store = mockStore({
      ico: {
        isWhitelisted: true,
      },
    });

    await act(async () => {
      rerender(
        <Provider store={store}>
          <WhitelistStatus />
        </Provider>
      );
    });

    expect(screen.getByText('You are whitelisted for this ICO.')).toBeInTheDocument();
  });
});

