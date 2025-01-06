import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

const mockStore = configureStore([]);

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
  });

  it('renders TierInfo component with correct headings', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
      expect(screen.getByText(/Your estimated total investment:/)).toBeInTheDocument();
    });
  });

  it('renders the tier table with correct headers', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tier')).toBeInTheDocument();
      expect(screen.getByText('Min Purchase (ETH)')).toBeInTheDocument();
      expect(screen.getByText('Max Purchase (ETH)')).toBeInTheDocument();
      expect(screen.getByText('Discount (%)')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  it('displays current tier and next tier requirement text', async () => {
    render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Your current tier:/)).toBeInTheDocument();
      expect(screen.getByText(/Next tier requirement:/)).toBeInTheDocument();
    });
  });
});

