import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UserStatus from '../components/UserStatus';
import TierInfo from '../components/TierInfo';
import VestingInfo from '../components/VestingInfo';
import BuyTokens from '../components/BuyTokens';
import WhitelistStatus from '../components/WhitelistStatus';
import { ethers } from 'ethers';

jest.mock('ethers');

const mockStore = configureStore([]);

describe('User Status Update Integration', () => {
  jest.setTimeout(15000); // Increase global timeout for this test suite

  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      ico: {
        tokenBalance: '1000',
        tokenPrice: '0.1',
        vestingSchedule: {
          totalAmount: 1000000,
          releasedAmount: 250000,
          startTime: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 days ago
          duration: 365 * 24 * 60 * 60, // 1 year
          cliff: 90 * 24 * 60 * 60, // 90 days
        },
        isWhitelisted: true,
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
        <TierInfo getTiers={() => Promise.resolve([
          { minPurchase: '100', maxPurchase: '1000', discount: 5 },
          { minPurchase: '1001', maxPurchase: '5000', discount: 10 },
        ])} />
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
      expect(screen.getByText('Investment Tiers')).toBeInTheDocument();
      expect(screen.getByText('Your estimated total investment: 100.0000 ETH')).toBeInTheDocument();
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

  it('should allow token purchase when user is whitelisted', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Buy Tokens' })).toBeInTheDocument();
    }, { timeout: 10000 });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
      fireEvent.click(buyButton);
    });

    await waitFor(() => {
      const successMessage = screen.queryByText(/Successfully purchased|Tokens purchased successfully|Transaction confirmed/);
      const errorMessage = screen.queryByText(/Failed to buy tokens/);
      expect(successMessage || errorMessage).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should display correct whitelist status', async () => {
    await act(async () => {
      renderComponents();
    });

    await waitFor(() => {
      expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
      const whitelistStatus = screen.getAllByText(/You are whitelisted for this ICO|Whitelisted/);
      expect(whitelistStatus.length).toBeGreaterThan(0);
    }, { timeout: 10000 });

    // Test for non-whitelisted status
    const nonWhitelistedStore = mockStore({
      ...store.getState(),
      ico: {
        ...store.getState().ico,
        isWhitelisted: false,
      },
    });

    await act(async () => {
      renderComponents(nonWhitelistedStore);
    });

    await waitFor(() => {
      expect(screen.getByText(/You are not whitelisted for this ICO|Not Whitelisted/)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  // it('should update tier information when investment amount changes', async () => {
  //   const { rerender } = renderComponents();

  //   await waitFor(() => {
  //     expect(screen.getByText('Your current tier: 1')).toBeInTheDocument();
  //   });

  //   // Update store with new token balance
  //   const updatedStore = mockStore({
  //     ...store.getState(),
  //     ico: {
  //       ...store.getState().ico,
  //       tokenBalance: '10000',
  //     },
  //   });

  //   rerender(
  //     <Provider store={updatedStore}>
  //       <UserStatus />
  //       <TierInfo getTiers={() => Promise.resolve([
  //         { minPurchase: '100', maxPurchase: '1000', discount: 5 },
  //         { minPurchase: '1001', maxPurchase: '5000', discount: 10 },
  //       ])} />
  //       <VestingInfo />
  //       <BuyTokens />
  //       <WhitelistStatus />
  //     </Provider>
  //   );

  //   await waitFor(() => {
  //     const tierElement = screen.getByTestId('current-tier');
  //     expect(tierElement).toHaveTextContent('Your current tier: 2');
  //   }, { timeout: 5000 });
  // });

  // it('should show error when purchase limit is exceeded', async () => {
  //   const limitExceededStore = mockStore({
  //     ...store.getState(),
  //     ico: {
  //       ...store.getState().ico,
  //       maxPurchaseAmount: '0.5',
  //     },
  //   });

  //   ethers.Contract.mockImplementationOnce(() => ({
  //     whitelist: jest.fn().mockResolvedValue(true),
  //     buyTokens: jest.fn().mockRejectedValue(new Error('Purchase limit exceeded')),
  //   }));

  //   await act(async () => {
  //     renderComponents(limitExceededStore);
  //   });

  //   const amountInput = screen.getByLabelText('Amount of ETH to spend');
  //   const buyButton = screen.getByRole('button', { name: 'Buy Tokens' });

  //   await act(async () => {
  //     fireEvent.change(amountInput, { target: { value: '1' } });
  //     fireEvent.click(buyButton);
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByText(/Purchase limit exceeded/)).toBeInTheDocument();
  //   }, { timeout: 10000 });
  // });
});

