import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';
import { ethers } from 'ethers';

const mockStore = configureStore([thunk]);

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
      buyTokens: jest.fn(() => Promise.resolve({ wait: () => Promise.resolve() })),
      cooldownTimeLeft: jest.fn(() => Promise.resolve({ toNumber: () => 0 })),
    })),
    utils: {
      parseEther: jest.fn(val => val),
    },
    BigNumber: {
      from: jest.fn(val => ({
        toNumber: () => parseInt(val),
        toString: () => val
      }))
    }
  },
}));

describe('BuyTokens', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        maxPurchaseAmount: '10',
      },
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
    };
  });

  it('renders buy tokens form when wallet is connected', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    expect(screen.getByRole('heading', { name: 'Buy Tokens' })).toBeInTheDocument();
    expect(screen.getByLabelText('Amount of ETH to spend')).toBeInTheDocument();
    expect(screen.getByLabelText('Referrer Address (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy Tokens' })).toBeInTheDocument();
  });

  it('updates amount when input changes', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    fireEvent.change(amountInput, { target: { value: '1' } });
    expect(amountInput.value).toBe('1');
  });

  it('displays estimated tokens to receive', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    fireEvent.change(amountInput, { target: { value: '1' } });
    expect(screen.getByText('10.00 TEST')).toBeInTheDocument();
  });

  it('handles increment button click', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const incrementButton = screen.getByRole('button', { name: '+' });

    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(incrementButton);
    expect(amountInput.value).toBe('0.01');
  });

  it('handles decrement button click', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const decrementButton = screen.getByRole('button', { name: '-' });

    fireEvent.change(amountInput, { target: { value: '0.02' } });
    fireEvent.click(decrementButton);
    expect(amountInput.value).toBe('0.01');

    fireEvent.click(decrementButton);
    expect(amountInput.value).toBe('0.00');

    fireEvent.click(decrementButton);
    expect(amountInput.value).toBe('0.00');
  });

  it('shows zero tokens to receive when amount is zero', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    fireEvent.change(amountInput, { target: { value: '0' } });

    // Check that the estimated tokens shows 0.00
    expect(screen.getByText('0.00 TEST')).toBeInTheDocument();
  });

  it('calculates estimated tokens correctly with token price changes', () => {
    const tokenPrice = '0.1';  // Initial price from store
    
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    fireEvent.change(amountInput, { target: { value: '1' } });

    // With 1 ETH at price of 0.1 ETH per token, should get 10 tokens
    const expectedTokens = (1 / parseFloat(tokenPrice)).toFixed(2);
    expect(screen.getByText(`${expectedTokens} TEST`)).toBeInTheDocument();
  });

  it('updates estimated tokens when token price changes', () => {
    const { rerender } = render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    fireEvent.change(amountInput, { target: { value: '1' } });

    expect(screen.getByText('10.00 TEST')).toBeInTheDocument();

    // Update store with new token price
    const newStore = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.2',
        maxPurchaseAmount: '10',
      },
    });

    // Rerender with new store
    rerender(
      <Provider store={newStore}>
        <BuyTokens />
      </Provider>
    );

    // Need to trigger input change again since the store update doesn't automatically recalculate
    fireEvent.change(amountInput, { target: { value: '1' } });
    expect(screen.getByText('5.00 TEST')).toBeInTheDocument();
  });
});

