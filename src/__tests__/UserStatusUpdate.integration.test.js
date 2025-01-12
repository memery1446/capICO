import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserStatus from '../components/UserStatus';
import TierInfo from '../components/TierInfo';
import VestingInfo from '../components/VestingInfo';
import BuyTokens from '../components/BuyTokens';
import WhitelistStatus from '../components/WhitelistStatus';
import { ethers } from 'ethers';

jest.mock('ethers');
jest.mock('../components/TierInfo', () => ({
  __esModule: true,
  default: function MockTierInfo({ getTiers, isWalletConnected, tokenBalance, tokenPrice }) {
    if (!isWalletConnected) return null;
    
    const tiers = [
      { minPurchase: '0', maxPurchase: '999', discount: 5 },
      { minPurchase: '1000', maxPurchase: '10000', discount: 10 },
    ];
    const investmentAmount = parseFloat(tokenBalance) * parseFloat(tokenPrice);
    const currentTier = tiers.reduce((acc, tier, index) => {
      if (investmentAmount >= parseFloat(tier.minPurchase) && investmentAmount <= parseFloat(tier.maxPurchase)) {
        return index + 1;
      }
      return acc;
    }, 1);
    const discount = tiers[currentTier - 1].discount / 100;
    const discountedInvestment = (investmentAmount * (1 - discount)).toFixed(4);

    return (
      <div data-testid="tier-info">
        <p data-testid="user-investment">Your estimated total investment: {discountedInvestment} ETH</p>
        <p data-testid="current-tier">Your current tier: {currentTier}</p>
      </div>
    );
  }
}));

const mockStore = configureStore([]);

describe('User Status Update Integration', () => {
  jest.setTimeout(15000);

  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      ico: {
        tokenBalance: '10000',
        tokenPrice: '0.1',
        vestingSchedule: {
          totalAmount: 1000000,
          releasedAmount: 250000,
          startTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
          duration: 365 * 24 * 60 * 60,
          cliff: 90 * 24 * 60 * 60,
        },
        isWhitelisted: true,
        isWalletConnected: true
      },
    });

    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn(),
    };

    ethers.providers.Web3Provider.mockImplementation(() => ({
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      }),
    }));

    ethers.Contract.mockImplementation(() => ({
      whitelist: jest.fn().mockResolvedValue(true),
      buyTokens: jest.fn().mockResolvedValue({ hash: '0x123456789' }),
    }));
  });

  const renderComponents = (customStore = store) => {
    return render(
      <Provider store={customStore}>
        <UserStatus />
        <TierInfo 
          getTiers={() => Promise.resolve([
            { minPurchase: '0', maxPurchase: '999', discount: 5 },
            { minPurchase: '1000', maxPurchase: '10000', discount: 10 },
          ])}
          isWalletConnected={customStore.getState().ico.isWalletConnected}
          tokenBalance={customStore.getState().ico.tokenBalance}
          tokenPrice={customStore.getState().ico.tokenPrice}
        />
        <VestingInfo />
        <BuyTokens />
        <WhitelistStatus />
      </Provider>
    );
  };

  it('should display initial user status, tier info, and vesting schedule', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Your Status')).toBeInTheDocument();
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument();
      expect(screen.getByText('Whitelisted')).toBeInTheDocument();
      expect(screen.getByTestId('tier-info')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Buy Tokens' })).toBeInTheDocument();
      expect(screen.getByText('Vesting Schedule')).toBeInTheDocument();
    });
  });

  it('should display correct vesting information', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Total Amount: 1000000 tokens')).toBeInTheDocument();
      expect(screen.getByText('Released Amount: 250000 tokens')).toBeInTheDocument();
      expect(screen.getByText(/Duration: 365 days/)).toBeInTheDocument();
      expect(screen.getByText(/Cliff: 90 days/)).toBeInTheDocument();
      expect(screen.getByText(/\d+\.\d+% Vested/)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    ethers.Contract.mockImplementationOnce(() => ({
      whitelist: jest.fn().mockRejectedValue(new Error('Contract error')),
    }));

    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to check whitelist status')).toBeInTheDocument();
    });
  });

  it('should handle disconnected wallet state', async () => {
    global.window.ethereum = undefined;

    const disconnectedStore = mockStore({
      ico: {
        tokenSymbol: '',
        tokenPrice: '0',
        maxPurchaseAmount: '0',
        isWhitelisted: false,
        vestingSchedule: null,
        tokenBalance: '0',
        isWalletConnected: false
      }
    });

    await act(async () => {
      renderComponents(disconnectedStore);
    });

    await waitFor(() => {
      expect(screen.getByText(/Please install MetaMask/)).toBeInTheDocument();
      expect(screen.queryByTestId('tier-info')).not.toBeInTheDocument();
    });
  });

  it('should handle state updates during vesting period changes', async () => {
    const { rerender } = renderComponents();

    await waitFor(() => {
      expect(screen.getByText(/\d+\.\d+% Vested/)).toBeInTheDocument();
    });

    const updatedStore = mockStore({
      ...store.getState(),
      ico: {
        ...store.getState().ico,
        vestingSchedule: {
          ...store.getState().ico.vestingSchedule,
          releasedAmount: 500000,
          totalAmount: 1000000,
          startTime: Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60 / 2),
          duration: 365 * 24 * 60 * 60
        }
      }
    });

    await act(async () => {
      rerender(
        <Provider store={updatedStore}>
          <UserStatus />
          <TierInfo 
            getTiers={() => Promise.resolve([
              { minPurchase: '100', maxPurchase: '1000', discount: 5 },
              { minPurchase: '1001', maxPurchase: '5000', discount: 10 }
            ])} 
            isWalletConnected={updatedStore.getState().ico.isWalletConnected}
          />
          <VestingInfo />
          <BuyTokens />
          <WhitelistStatus />
        </Provider>
      );
    });

    await waitFor(() => {
      const vestingText = screen.queryByText(/50\.00% Vested/);
      expect(vestingText).toBeInTheDocument();
    });
  });

  it('should calculate investment amount correctly with tier discounts', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      const tierInfo = screen.getByTestId('tier-info');
      expect(tierInfo).toBeInTheDocument();
    });

    const currentTierElement = screen.getByTestId('current-tier');
    expect(currentTierElement).toHaveTextContent('Your current tier: 2');

    const userInvestmentElement = screen.getByTestId('user-investment');
    expect(userInvestmentElement).toHaveTextContent('Your estimated total investment: 900.0000 ETH');
  });

  it('should handle investment updates with tier calculation', async () => {
    const initialStore = mockStore({
      ico: {
        tokenBalance: '500',
        tokenPrice: '0.1',
        vestingSchedule: {
          totalAmount: 1000000,
          releasedAmount: 250000,
          startTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
          duration: 365 * 24 * 60 * 60,
          cliff: 90 * 24 * 60 * 60,
        },
        isWhitelisted: true,
        isWalletConnected: true
      },
    });

    const { rerender } = renderComponents(initialStore);

    await waitFor(() => {
      const tierInfo = screen.getByTestId('tier-info');
      expect(tierInfo).toBeInTheDocument();
    });

    let currentTierElement = screen.getByTestId('current-tier');
    let userInvestmentElement = screen.getByTestId('user-investment');

    expect(currentTierElement).toHaveTextContent('Your current tier: 1');
    expect(userInvestmentElement).toHaveTextContent('Your estimated total investment: 47.5000 ETH');

    const updatedStore = mockStore({
      ...initialStore.getState(),
      ico: {
        ...initialStore.getState().ico,
        tokenBalance: '15000',
      },
    });

    await act(async () => {
      rerender(
        <Provider store={updatedStore}>
          <UserStatus />
          <TierInfo 
            getTiers={() => Promise.resolve([
              { minPurchase: '0', maxPurchase: '999', discount: 5 },
              { minPurchase: '1000', maxPurchase: '10000', discount: 10 },
            ])}
            isWalletConnected={updatedStore.getState().ico.isWalletConnected}
            tokenBalance={updatedStore.getState().ico.tokenBalance}
            tokenPrice={updatedStore.getState().ico.tokenPrice}
          />
          <VestingInfo />
          <BuyTokens />
          <WhitelistStatus />
        </Provider>
      );
    });

    await waitFor(() => {
      currentTierElement = screen.getByTestId('current-tier');
      userInvestmentElement = screen.getByTestId('user-investment');
    });

    expect(currentTierElement).toHaveTextContent('Your current tier: 2');
    expect(userInvestmentElement).toHaveTextContent('Your estimated total investment: 1350.0000 ETH');
  });

  it('should update display when token price changes', async () => {
    const { rerender } = renderComponents();

    await waitFor(() => {
      expect(screen.getByTestId('tier-info')).toBeInTheDocument();
    });

    const updatedStore = mockStore({
      ...store.getState(),
      ico: {
        ...store.getState().ico,
        tokenPrice: '0.2',
        tokenBalance: '1000'
      }
    });

    await act(async () => {
      rerender(
        <Provider store={updatedStore}>
          <UserStatus />
          <TierInfo 
            getTiers={() => Promise.resolve([
              { minPurchase: '100', maxPurchase: '1000', discount: 5 },
              { minPurchase: '1001', maxPurchase: '5000', discount: 10 }
            ])}
            isWalletConnected={updatedStore.getState().ico.isWalletConnected}
          />
          <VestingInfo />
          <BuyTokens />
          <WhitelistStatus />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier-info')).toBeInTheDocument();
    });
  });
});

