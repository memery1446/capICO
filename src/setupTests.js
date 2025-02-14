import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import * as React from 'react';

configure({ asyncUtilTimeout: 5000 });

global.act = React.act;

jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ethers: {
      providers: {
        Web3Provider: jest.fn(() => ({
          getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' }),
          getSigner: jest.fn(() => ({
            getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
            signMessage: jest.fn().mockResolvedValue('0xmockedsignature'),
          })),
          getBalance: jest.fn().mockResolvedValue(original.BigNumber.from('1000000000000000000')),
          on: jest.fn(),
          removeListener: jest.fn(),
        })),
      },
      Contract: jest.fn(() => ({
        getTierCount: jest.fn().mockResolvedValue(3),
        getTier: jest.fn().mockImplementation((index) => {
          const tiers = [
            [original.BigNumber.from('100000000000000000000'), original.BigNumber.from('1000000000000000000000'), original.BigNumber.from(5)],
            [original.BigNumber.from('1000000000000000000000'), original.BigNumber.from('5000000000000000000000'), original.BigNumber.from(10)],
            [original.BigNumber.from('5000000000000000000000'), original.BigNumber.from('10000000000000000000000'), original.BigNumber.from(15)],
          ];
          return Promise.resolve(tiers[index]);
        }),
        isActive: jest.fn().mockResolvedValue(true),
        totalRaised: jest.fn().mockResolvedValue(original.BigNumber.from('1000000000000000000000')),
        hardCap: jest.fn().mockResolvedValue(original.BigNumber.from('10000000000000000000000')),
        tokenPrice: jest.fn().mockResolvedValue(original.BigNumber.from('100000000000000000')),
        getCurrentTokenPrice: jest.fn().mockResolvedValue(original.BigNumber.from('100000000000000000')), // Add this line
        isActive: jest.fn().mockResolvedValue(true),
      })),
      utils: {
        formatEther: jest.fn(val => original.utils.formatEther(val)),
      },
    },
  };
});

const originalError = console.error;
console.error = (...args) => {
  if (args[0].includes('Warning: ReactDOM.render is no longer supported in React 18')) {
    return;
  }
  if (args[0].includes('Warning: An update to Component inside a test was not wrapped in act')) {
    return;
  }
  if (args[0].includes('Warning: `ReactDOMTestUtils.act` is deprecated')) {
    return;
  }
  if (args[0].includes('Error fetching transaction history:')) {
    return;
  }
  if (args[0].includes('Error checking whitelist status:')) {
    return;
  }
  if (args[0].includes('Error fetching tiers:')) {
    return;
  }
  if (args[0].includes('Error fetching contract state:')) {
    return;
  }
  if (args[0].includes('Error fetching ICO status:')) {
    return;
  }
  if (args[0].includes('Error fetching vesting and lockup info:')) {
    return;
  }
  if (args[0].includes('Error checking cooldown:')) {
    return;
  }
  if (args[0].includes('Error buying tokens:')) {
    return;
  }
  if (args[0].includes('Error connecting wallet:')) {
    return;
  }
  if (args[0].includes('provider.getSigner is not a function')) {
    return;
  }
  if (args[0].includes('Error fetching referral info:')) {
    return;
  }
    if (args[0].includes('Error fetching referral info:')) {
    return;
  }
  if (args[0].includes('Error checking wallet connection:')) {
    return;
  }
  if (args[0].includes('Error setting referrer: Error: Invalid address')) {
      return;
  }
  if (args[0].includes('Error updating price:')) {
  return;
}
if (args[0].includes('Error updating price after transaction:')) {
  return;
}
  if (args[0].includes('Error setting referrer: Error:')) {
    return;
  }

  originalError.apply(console, args);
};

expect.extend({
  toHaveInvestmentAmount(received, min, max) {
    const text = received.textContent;
    const match = text.match(/Your estimated total investment: ([\d.]+) ETH/);
    if (!match) {
      return {
        message: () => `expected "${text}" to contain an investment amount`,
        pass: false,
      };
    }
    const amount = parseFloat(match[1]);
    const pass = amount >= min && amount <= max;
    if (pass) {
      return {
        message: () => `expected "${text}" not to have an investment amount between ${min} and ${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${text}" to have an investment amount between ${min} and ${max}`,
        pass: false,
      };
    }
  },
});
global.window.ethereum = {
  request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
  isMetaMask: true,
  on: jest.fn(),
  removeListener: jest.fn(),
};

