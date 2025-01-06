import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import WhitelistStatus from '../components/WhitelistStatus';

jest.mock('react-dom/test-utils', () => ({
  ...jest.requireActual('react-dom/test-utils'),
  act: jest.requireActual('react').act,
}));

const mockStore = configureStore([thunk]);

describe('WhitelistStatus', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ico: {
        isWhitelisted: false,
      },
    });

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234567890123456789012345678901234567890'])),
    };
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
});

