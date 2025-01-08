import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';

const mockStore = configureStore([thunk]);

// Mock ethers before other imports
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: jest.fn(() => ({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
          getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH
        })),
      })),
    },
    Contract: jest.fn(() => ({
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 }),
      buyTokens: jest.fn().mockRejectedValue(new Error('Insufficient funds')),
      balanceOf: jest.fn().mockResolvedValue('1000'),
      hardCap: jest.fn().mockResolvedValue('10000000000000000000000'), // 10000 ETH
      totalRaised: jest.fn().mockResolvedValue('0'),
      minPurchase: jest.fn().mockResolvedValue('100000000000000000'), // 0.1 ETH
    })),
    utils: {
      parseEther: jest.fn(val => val),
      formatEther: jest.fn(val => val),
    },
  },
}));

describe('BuyTokens Error Handling', () => {
  let store;
  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        hardCap: '10000',
        totalRaised: '0',
      },
    });

    jest.clearAllMocks();

    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH
    };

    mockProvider = {
      getSigner: jest.fn().mockReturnValue(mockSigner),
    };

    mockContract = {
      cooldownTimeLeft: jest.fn().mockResolvedValue({ toNumber: () => 0 }),
      buyTokens: jest.fn().mockRejectedValue(new Error('Insufficient funds')),
      balanceOf: jest.fn().mockResolvedValue('1000'),
      hardCap: jest.fn().mockResolvedValue('10000000000000000000000'),
      totalRaised: jest.fn().mockResolvedValue('0'),
      minPurchase: jest.fn().mockResolvedValue('100000000000000000'),
    };

    require('ethers').ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    require('ethers').ethers.Contract.mockImplementation(() => mockContract);
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );
  };

  // Existing tests remain here...

  it('shows error when trying to buy with amount below minimum', async () => {
    mockContract.minPurchase.mockResolvedValue('100000000000000000'); // 0.1 ETH minimum
    
    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '0.01' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

  it('shows error when trying to buy above hardcap', async () => {
    mockContract.hardCap.mockResolvedValue('1000000000000000000000'); // 1000 ETH
    mockContract.totalRaised.mockResolvedValue('999000000000000000000'); // 999 ETH

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '2' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

  it('handles invalid referrer address error', async () => {
    const invalidReferrerError = new Error('Invalid referrer address');
    mockContract.buyTokens.mockRejectedValueOnce(invalidReferrerError);

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const referrerInput = screen.getByLabelText(/referrer address/i);
    
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
      fireEvent.change(referrerInput, { target: { value: 'invalid-address' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

  it('shows error when user wallet has insufficient balance', async () => {
    mockSigner.getBalance.mockResolvedValue('100000000000000000'); // 0.1 ETH

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

  it('handles network connection errors gracefully', async () => {
    const networkError = new Error('Network error');
    networkError.code = 'NETWORK_ERROR';
    mockContract.buyTokens.mockRejectedValueOnce(networkError);

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

  it('shows error when transaction is stuck pending', async () => {
    const pendingTx = { wait: jest.fn().mockRejectedValue(new Error('Transaction timeout')) };
    mockContract.buyTokens.mockResolvedValueOnce(pendingTx);

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

it('handles multiple rapid buy attempts during cooldown', async () => {
    // Setup initial cooldown check
    mockContract.cooldownTimeLeft
      .mockResolvedValueOnce({ toNumber: () => 0 })  // Initial check: no cooldown
      .mockResolvedValueOnce({ toNumber: () => 300 }) // After first attempt: 5 minutes
      .mockResolvedValueOnce({ toNumber: () => 300 }); // Subsequent check: still 5 minutes

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });

    // First attempt (should succeed and trigger cooldown)
    mockContract.buyTokens.mockResolvedValueOnce({ 
      wait: jest.fn().mockResolvedValue(true) 
    });

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
      fireEvent.click(buyButton);
    });

    // Allow cooldown check to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify cooldown message format matches component
    expect(screen.getByText('Cooldown period: 05:00 remaining')).toBeInTheDocument();
    expect(buyButton).toBeDisabled();
  });

  it('shows error when gas estimation fails', async () => {
    const gasError = new Error('Gas estimation failed');
    gasError.code = 'UNPREDICTABLE_GAS_LIMIT';
    mockContract.buyTokens.mockRejectedValueOnce(gasError);

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
    });

    const buyButton = screen.getByRole('button', { name: /buy tokens/i });
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });

  it('recovers from failed transaction and allows retry', async () => {
    // First attempt fails
    mockContract.buyTokens.mockRejectedValueOnce(new Error('Transaction failed'));

    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });

    // First attempt
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();

    // Setup success for retry
    mockContract.buyTokens.mockResolvedValueOnce({ 
      wait: jest.fn().mockResolvedValue(true) 
    });

    // Retry
    await act(async () => {
      fireEvent.click(buyButton);
    });

    expect(screen.getByText(/successfully purchased tokens/i)).toBeInTheDocument();
  });

  it('preserves referral info after failed transaction', async () => {
    await act(async () => {
      renderComponent();
    });

    const amountInput = screen.getByLabelText('Amount of ETH to spend');
    const referrerInput = screen.getByLabelText(/referrer address/i);
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });

    // Fill form and submit
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } });
      fireEvent.change(referrerInput, { 
        target: { value: '0x9876543210987654321098765432109876543210' } 
      });
    });

    await act(async () => {
      fireEvent.click(buyButton);
    });

    // Check that referrer info is preserved after error
    expect(referrerInput.value).toBe('0x9876543210987654321098765432109876543210');
    expect(screen.getByText(/failed to buy tokens/i)).toBeInTheDocument();
  });
});

