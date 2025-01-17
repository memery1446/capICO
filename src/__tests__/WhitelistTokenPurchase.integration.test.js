import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BuyTokens from '../components/BuyTokens';
import { ethers } from 'ethers';

const mockStore = configureStore([thunk]);

jest.mock('ethers');

describe('WhitelistTokenPurchase Integration', () => {
  let store;
  let mockBuyTokens;

  beforeEach(() => {
    mockBuyTokens = jest.fn().mockResolvedValue({ 
      wait: jest.fn().mockResolvedValue(true) 
    });

    store = mockStore({
      ico: {
        isWhitelisted: true,
        tokenSymbol: 'TEST',
        tokenPrice: '0.1',
        maxPurchaseAmount: '10',
      },
      wallet: {
        isConnected: true,
        address: '0x1234'
      }
    });

    ethers.providers.Web3Provider.mockImplementation(() => ({
      getSigner: jest.fn(() => ({
        getAddress: jest.fn(() => Promise.resolve('0x1234')),
      })),
    }));

    ethers.Contract.mockImplementation(() => ({
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: jest.fn(() => Promise.resolve({ toNumber: () => 0 }))
    }));

    ethers.utils.parseEther = jest.fn(val => val);

    global.window.ethereum = {
      request: jest.fn(() => Promise.resolve(['0x1234'])),
    };
  });

  it('allows whitelisted users to purchase tokens', async () => {
    const { container } = render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    // Set amount
    const amountInput = screen.getByRole('spinbutton', { name: /amount of eth to spend/i });
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1.0' } });
      fireEvent.click(buyButton);
    });

    expect(mockBuyTokens).toHaveBeenCalled();
  });

  it('prevents purchase when cooldown period is active', async () => {
    ethers.Contract.mockImplementation(() => ({
      buyTokens: mockBuyTokens,
      cooldownTimeLeft: jest.fn(() => Promise.resolve({ toNumber: () => 60 }))
    }));

    render(
      <Provider store={store}>
        <BuyTokens />
      </Provider>
    );

    const cooldownText = await screen.findByText(/cooldown period: \d{2}:\d{2} remaining/i);
    const buyButton = screen.getByRole('button', { name: /buy tokens/i });

    expect(cooldownText).toBeInTheDocument();
    expect(buyButton).toHaveAttribute('disabled');
  });
});

