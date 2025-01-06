import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ICOStatus from '../components/ICOStatus';

const mockStore = configureStore([]);

describe('ICOStatus', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isActive: true,
        isCooldownEnabled: false,
        isVestingEnabled: true,
        totalRaised: '1',
        hardCap: '10',
        tokenPrice: '0.1',
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        tokenBalance: '5',
        totalSupply: '100',
        tokensRemaining: '95',
      },
    });
  });

  it('renders the ICO Status title', () => {
    render(
      <Provider store={store}>
        <ICOStatus />
      </Provider>
    );

    expect(screen.getByText('ICO Status')).toBeInTheDocument();
  });
});

