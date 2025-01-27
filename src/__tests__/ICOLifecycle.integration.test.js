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

  it('manages tier transitions based on total raised', () => {
    // Initial state - Tier 1
    const initialStore = mockStore({
      ico: {
        isActive: true,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        totalRaised: '1000',
        hardCap: '10000',
        isPaused: false,
        currentTier: 1,
        tierLimits: {
          1: '2000',
          2: '5000',
          3: '10000'
        },
        tierDiscounts: {
          1: '0',
          2: '5',
          3: '10'
        }
      }
    });

    render(
      <Provider store={initialStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify initial tier state
    let state = initialStore.getState();
    expect(state.ico.currentTier).toBe(1);
    expect(parseInt(state.ico.totalRaised)).toBeLessThan(parseInt(state.ico.tierLimits[2]));

    // Transition to Tier 2
    const tier2Store = mockStore({
      ico: {
        ...state.ico,
        totalRaised: '3000',
        currentTier: 2,
        tokenPrice: '0.095' // 5% discount
      }
    });

    render(
      <Provider store={tier2Store}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify Tier 2 state
    state = tier2Store.getState();
    expect(state.ico.currentTier).toBe(2);
    expect(state.ico.tokenPrice).toBe('0.095');
    expect(parseInt(state.ico.totalRaised)).toBeGreaterThan(parseInt(state.ico.tierLimits[1]));

    // Transition to final tier
    const tier3Store = mockStore({
      ico: {
        ...state.ico,
        totalRaised: '6000',
        currentTier: 3,
        tokenPrice: '0.09' // 10% discount
      }
    });

    render(
      <Provider store={tier3Store}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify final tier state
    state = tier3Store.getState();
    expect(state.ico.currentTier).toBe(3);
    expect(state.ico.tokenPrice).toBe('0.09');
    expect(parseInt(state.ico.totalRaised)).toBeGreaterThan(parseInt(state.ico.tierLimits[2]));
  });

  it('enforces whitelist rules across tier transitions', () => {
    // Initial state - Tier 1, whitelist only period
    const initialStore = mockStore({
      ico: {
        isActive: true,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        totalRaised: '0',
        hardCap: '10000',
        isPaused: false,
        currentTier: 1,
        isWhitelistOnly: true,
        whitelistPurchaseLimit: '5000',
        publicPurchaseLimit: '1000',
        whitelist: {
          '0x1234567890123456789012345678901234567890': {
            isWhitelisted: true,
            allocatedAmount: '5000'
          }
        }
      }
    });

    render(
      <Provider store={initialStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify initial whitelist state
    let state = initialStore.getState();
    expect(state.ico.isWhitelistOnly).toBe(true);
    expect(state.ico.whitelist['0x1234567890123456789012345678901234567890'].isWhitelisted).toBe(true);

    // Transition to public phase but maintain whitelist benefits
    const publicPhaseStore = mockStore({
      ico: {
        ...state.ico,
        isWhitelistOnly: false,
        totalRaised: '2000',
        currentTier: 2,
        tokenPrice: '0.095' // 5% discount
      }
    });

    render(
      <Provider store={publicPhaseStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify public phase with whitelist privileges
    state = publicPhaseStore.getState();
    expect(state.ico.isWhitelistOnly).toBe(false);
    expect(state.ico.whitelist['0x1234567890123456789012345678901234567890'].allocatedAmount)
      .toBe('5000'); // Whitelist allocation maintained

    // Final tier with mixed whitelist/public
    const finalTierStore = mockStore({
      ico: {
        ...state.ico,
        totalRaised: '6000',
        currentTier: 3,
        tokenPrice: '0.09', // 10% discount
        whitelistPurchaseLimit: '7500', 
        publicPurchaseLimit: '2000'  
      }
    });

    render(
      <Provider store={finalTierStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    // Verify final state maintains purchase limits
    state = finalTierStore.getState();
    expect(parseInt(state.ico.whitelistPurchaseLimit)).toBeGreaterThan(parseInt(state.ico.publicPurchaseLimit));
    expect(state.ico.currentTier).toBe(3);
    expect(state.ico.tokenPrice).toBe('0.09');
  });

  it('applies early contributor bonuses correctly across ICO phases', () => {
    // Early phase with max bonus
    const initialStore = mockStore({
      ico: {
        isActive: true,
        tokenSymbol: 'TEST',
        totalRaised: '0',
        hardCap: '10000',
        currentPhase: 'EARLY',
        earlyBonus: '20',
        earlyBonusThreshold: '1000',
        contributorBalances: {}
      }
    });

    render(
      <Provider store={initialStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    let state = initialStore.getState();
    expect(state.ico.currentPhase).toBe('EARLY');
    expect(parseInt(state.ico.earlyBonus)).toBe(20);

    // Mid-ICO with reduced bonus
    const midPhaseStore = mockStore({
      ico: {
        ...state.ico,
        currentPhase: 'MAIN',
        totalRaised: '2000',
        earlyBonus: '10',
        contributorBalances: {
          '0x1234': '500'
        }
      }
    });

    render(
      <Provider store={midPhaseStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    state = midPhaseStore.getState();
    expect(state.ico.currentPhase).toBe('MAIN');
    expect(parseInt(state.ico.earlyBonus)).toBe(10);

    // Final phase - no bonus
    const finalPhaseStore = mockStore({
      ico: {
        ...state.ico,
        currentPhase: 'FINAL',
        totalRaised: '8000',
        earlyBonus: '0'
      }
    });

    render(
      <Provider store={finalPhaseStore}>
        <ICOStatus />
        <BuyTokens />
      </Provider>
    );

    state = finalPhaseStore.getState();
    expect(state.ico.currentPhase).toBe('FINAL');
    expect(parseInt(state.ico.earlyBonus)).toBe(0);
  });
});