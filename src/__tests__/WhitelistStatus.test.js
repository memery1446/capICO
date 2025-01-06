import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import WhitelistStatus from '../components/WhitelistStatus';

const mockStore = configureStore([]);

describe('WhitelistStatus', () => {
  it('renders the component with initial not whitelisted state', () => {
    const store = mockStore({
      ico: {
        isWhitelisted: false,
      },
    });

    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are not whitelisted for this ICO.')).toBeInTheDocument();
  });

  it('renders the component with whitelisted state', () => {
    const store = mockStore({
      ico: {
        isWhitelisted: true,
      },
    });

    render(
      <Provider store={store}>
        <WhitelistStatus />
      </Provider>
    );

    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('You are whitelisted for this ICO.')).toBeInTheDocument();
  });
});

