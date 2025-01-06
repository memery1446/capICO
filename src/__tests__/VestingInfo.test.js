import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import VestingInfo from '../components/VestingInfo';

const mockStore = configureStore([]);

describe('VestingInfo', () => {
  let store;

  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

    store = mockStore({
      ico: {
        vestingSchedule: {
          totalAmount: 1000000,
          releasedAmount: 250000,
          startTime: Math.floor(new Date('2022-01-01T00:00:00Z').getTime() / 1000),
          duration: 365 * 24 * 60 * 60, // 1 year in seconds
          cliff: 90 * 24 * 60 * 60, // 90 days in seconds
        },
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the vesting information correctly', () => {
    render(
      <Provider store={store}>
        <VestingInfo />
      </Provider>
    );

    expect(screen.getByText('Vesting Schedule')).toBeInTheDocument();
    expect(screen.getByText('Total Amount: 1000000 tokens')).toBeInTheDocument();
    expect(screen.getByText('Released Amount: 250000 tokens')).toBeInTheDocument();
    expect(screen.getByText(/Start Time:/)).toBeInTheDocument();
    expect(screen.getByText('Duration: 365 days')).toBeInTheDocument();
    expect(screen.getByText('Cliff: 90 days')).toBeInTheDocument();
    expect(screen.getByText('100.00% Vested')).toBeInTheDocument();
  });

  it('displays "No vesting schedule available" when there is no schedule', () => {
    store = mockStore({
      ico: {
        vestingSchedule: null,
      },
    });

    render(
      <Provider store={store}>
        <VestingInfo />
      </Provider>
    );

    expect(screen.getByText('No vesting schedule available.')).toBeInTheDocument();
  });
});

