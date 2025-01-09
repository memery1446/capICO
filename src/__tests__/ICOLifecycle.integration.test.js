import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ICOStatus from '../components/ICOStatus';
import BuyTokens from '../components/BuyTokens';

const mockStore = configureStore([thunk]);

describe('ICO Lifecycle State Management', () => {
  it('tracks ICO state progression correctly', () => {
    // Initial active state
    const initialStore = mockStore({
      ico: {
        isActive: true,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        totalRaised: '7500',
        hardCap: '10000',
        isPaused: false,
        isSoldOut: false
      }
    });

    render(
      <Provider store={initialStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify initial state
    let state = initialStore.getState();
    expect(state.ico.isActive).toBe(true);
    expect(state.ico.isPaused).toBe(false);
    expect(state.ico.isSoldOut).toBe(false);

    // Update to near hardcap state
    const nearCapStore = mockStore({
      ico: {
        ...state.ico,
        totalRaised: '9500'
      }
    });

    render(
      <Provider store={nearCapStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify approaching hardcap
    state = nearCapStore.getState();
    expect(parseInt(state.ico.totalRaised)).toBeLessThan(parseInt(state.ico.hardCap));
    expect(parseInt(state.ico.totalRaised) / parseInt(state.ico.hardCap)).toBeGreaterThan(0.9);

    // Final hardcap reached state
    const hardcapStore = mockStore({
      ico: {
        ...state.ico,
        isActive: false,
        totalRaised: '10000',
        isPaused: true,
        isSoldOut: true
      }
    });

    render(
      <Provider store={hardcapStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify final state flags
    state = hardcapStore.getState();
    expect(state.ico.isActive).toBe(false);
    expect(state.ico.isPaused).toBe(true);
    expect(state.ico.isSoldOut).toBe(true);
    expect(state.ico.totalRaised).toBe(state.ico.hardCap);
  });

  it('handles emergency pause state transitions correctly', () => {
    // Initial active state
    const initialStore = mockStore({
      ico: {
        isActive: true,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        totalRaised: '5000',
        hardCap: '10000',
        isPaused: false,
        isSoldOut: false,
        emergencyStop: false
      }
    });

    render(
      <Provider store={initialStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify initial state
    let state = initialStore.getState();
    expect(state.ico.isActive).toBe(true);
    expect(state.ico.emergencyStop).toBe(false);
    expect(state.ico.isPaused).toBe(false);

    // Simulate emergency stop
    const emergencyStore = mockStore({
      ico: {
        ...state.ico,
        isActive: false,
        isPaused: true,
        emergencyStop: true,
        lastPauseReason: 'EMERGENCY_STOP'
      }
    });

    render(
      <Provider store={emergencyStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify emergency state
    state = emergencyStore.getState();
    expect(state.ico.isActive).toBe(false);
    expect(state.ico.emergencyStop).toBe(true);
    expect(state.ico.isPaused).toBe(true);
    expect(state.ico.lastPauseReason).toBe('EMERGENCY_STOP');

    // Test resume from emergency
    const resumeStore = mockStore({
      ico: {
        ...state.ico,
        isActive: true,
        isPaused: false,
        emergencyStop: false,
        lastPauseReason: null
      }
    });

    render(
      <Provider store={resumeStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify resumed state
    state = resumeStore.getState();
    expect(state.ico.isActive).toBe(true);
    expect(state.ico.emergencyStop).toBe(false);
    expect(state.ico.isPaused).toBe(false);
    expect(state.ico.lastPauseReason).toBeNull();
  });
});