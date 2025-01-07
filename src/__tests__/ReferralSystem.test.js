import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ReferralSystem from '../components/ReferralSystem';

const mockStore = configureStore([thunk]);

describe('ReferralSystem', () => {
  let store;
  let mockEthersService;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      referral: {
        isWalletConnected: true,
        referralBonus: '10',
        currentReferrer: '0x9876543210987654321098765432109876543210',
      },
      ico: {
        tokenSymbol: 'TEST',
      },
    });

    mockEthersService = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      getReferralBonus: jest.fn().mockResolvedValue('10'),
      getCurrentReferrer: jest.fn().mockResolvedValue('0x9876543210987654321098765432109876543210'),
      setReferrer: jest.fn().mockResolvedValue(true),
    };
  });

  it('renders correctly when wallet is connected', async () => {
    render(
      <Provider store={store}>
        <ReferralSystem ethersService={mockEthersService} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Referral System')).toBeInTheDocument();
      expect(screen.getByText('Your Referral Bonus: 10 TEST')).toBeInTheDocument();
      expect(screen.getByText('Current Referrer: 0x9876543210987654321098765432109876543210')).toBeInTheDocument();
    });
  });

  it('renders correctly when wallet is not connected', async () => {
    store = mockStore({
      referral: {
        isWalletConnected: false,
        referralBonus: '0',
        currentReferrer: '',
      },
      ico: {
        tokenSymbol: 'TEST',
      },
    });

    render(
      <Provider store={store}>
        <ReferralSystem ethersService={mockEthersService} />
      </Provider>
    );

    expect(screen.getByText('Referral System')).toBeInTheDocument();
    expect(screen.getByText('Please connect your wallet to view and interact with the referral system.')).toBeInTheDocument();
  });

  it('allows setting a new referrer', async () => {
    render(
      <Provider store={store}>
        <ReferralSystem ethersService={mockEthersService} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter referrer address');
    fireEvent.change(input, { target: { value: '0x1111111111111111111111111111111111111111' } });

    const setReferrerButton = screen.getByText('Set Referrer');
    fireEvent.click(setReferrerButton);

    await waitFor(() => {
      expect(mockEthersService.setReferrer).toHaveBeenCalledWith('0x1111111111111111111111111111111111111111');
    });
  });
});

