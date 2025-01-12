import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WhitelistStatus from '../components/WhitelistStatus';
import BuyTokens from '../components/BuyTokens';

// Increase timeout for async tests
jest.setTimeout(10000);

const mockStore = configureStore([thunk]);

describe('WhitelistTokenPurchase', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isWhitelisted: false,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        tokenBalance: '10',
        maxPurchaseAmount: '10',
      },
    });
  });

  it('renders WhitelistStatus correctly', () => {
    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('updates WhitelistStatus when whitelist status changes', () => {
    const { rerender } = render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();

    store = mockStore({
      ico: {
        ...store.getState().ico,
        isWhitelisted: true,
      },
    });

    rerender(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('You are whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('renders BuyTokens form correctly', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    expect(screen.getByLabelText('Amount of ETH to spend')).toBeInTheDocument();
    expect(screen.getByLabelText('Referrer Address (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy Tokens' })).toBeInTheDocument();
  });

  it('updates estimated tokens when amount changes', async () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    // First verify the initial state
    await waitFor(() => {
      expect(screen.getByText(/Estimated tokens to receive:/)).toBeInTheDocument();
    }, { timeout: 6000 });

    // Then make the change
    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    fireEvent.change(amountInput, { target: { value: '1' } });

    // Look for the updated value
    await waitFor(() => {
      const estimatedText = screen.getByText(/Estimated tokens to receive:/);
      expect(estimatedText.textContent).toContain('10.00 TEST');
    }, { timeout: 6000 });
  });

  it('does not disable buy button for non-whitelisted users', () => {
    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    expect(buyButton).not.toHaveAttribute('disabled');
  });

  it('enables buy button for whitelisted users', () => {
    store = mockStore({
      ico: {
        ...store.getState().ico,
        isWhitelisted: true,
      },
    });

    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });
    expect(buyButton).not.toHaveAttribute('disabled');
  });
});

