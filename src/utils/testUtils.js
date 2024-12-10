// src/utils/testUtils.js
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

export const CHAIN_IDS = {
  HARDHAT: 1337,
  SEPOLIA: 11155111
};

export const mockWeb3Provider = {
  chainId: CHAIN_IDS.SEPOLIA,
  selectedAddress: null,
  isConnected: false,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn()
};

export const createMockNetworkState = (chainId = CHAIN_IDS.SEPOLIA) => ({
  blockchain: {
    isLoading: false,
    error: null,
    chainId,
    isCorrectNetwork: chainId === CHAIN_IDS.SEPOLIA
  }
});

export const mockWalletState = (isConnected = false, address = null) => ({
  account: {
    isConnected,
    address,
    balance: '0',
    error: null
  }
});

// Helper to render components with mock store
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = configureMockStore([thunk])({
      ...createMockNetworkState(),
      ...mockWalletState(),
      ...initialState
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Network switching mock
export const mockNetworkSwitch = async (targetChainId) => {
  mockWeb3Provider.request.mockImplementationOnce(async ({ method }) => {
    if (method === 'wallet_switchEthereumChain') {
      mockWeb3Provider.chainId = targetChainId;
      return null;
    }
    throw new Error('Method not implemented');
  });
};

// Wallet connection mock
export const mockWalletConnect = async (address = '0x123...') => {
  mockWeb3Provider.request.mockImplementationOnce(async ({ method }) => {
    if (method === 'eth_requestAccounts') {
      mockWeb3Provider.selectedAddress = address;
      mockWeb3Provider.isConnected = true;
      return [address];
    }
    throw new Error('Method not implemented');
  });
};


