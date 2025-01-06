import React from 'react';
import { render, screen, act } from '@testing-library/react';
import UserStatus from '../components/UserStatus';

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn(() => ({
        getSigner: () => ({
          getAddress: () => Promise.resolve('0x1234567890123456789012345678901234567890')
        })
      }))
    },
    Contract: jest.fn(() => ({
      whitelist: jest.fn().mockResolvedValue(false)
    }))
  }
}));

describe('UserStatus', () => {
  beforeEach(() => {
    global.window.ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890'])
    };
  });

  it('should render basic elements', async () => {
    await act(async () => {
      render(<UserStatus />);
    });
    expect(screen.getByText('Your Status')).toBeInTheDocument();
  });
});

