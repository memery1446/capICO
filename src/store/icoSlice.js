import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import ICO_ABI from '../contracts/CapICO.json';

const initialState = {
  isActive: false,
  isCooldownEnabled: false,
  isVestingEnabled: false,
  totalRaised: '0',
  tokenBalance: '0',
  hardCap: '0',
  tokenPrice: '0',
  tokenName: '',
  tokenSymbol: '',
  contractOwner: '',
  totalSupply: '0',
  tokensRemaining: '0',
  isWhitelisted: false,
  cooldownTimeLeft: 0,
  tiers: [],
  vestingSchedule: null,
  transactionHistory: [],
  referralBonus: '0',
  lockedTokens: '0',
  currentTokenPrice: '0',
  estimatedTokens: '0',
  isLoading: false,
  error: null,
};

export const fetchTransactionHistory = createAsyncThunk(
  'ico/fetchTransactionHistory',
  async (address, { getState }) => {
    const { provider } = getState().wallet;
    if (!provider) throw new Error('No provider available');

    const contract = new ethers.Contract(ICO_ADDRESS, ICO_ABI, provider);
    
    const filter = contract.filters.TokensPurchased(address);
    const events = await contract.queryFilter(filter);

    return events.map(event => ({
      id: event.transactionHash,
      amount: ethers.utils.formatEther(event.args.amount),
      tokens: ethers.utils.formatEther(event.args.tokens),
      date: new Date(event.blockNumber * 1000).toISOString(),
    }));
  }
);

export const icoSlice = createSlice({
  name: 'ico',
  initialState,
  reducers: {
    setICOStatus: (state, action) => {
      state.isActive = action.payload;
    },
    setCooldownStatus: (state, action) => {
      state.isCooldownEnabled = action.payload;
    },
    setVestingStatus: (state, action) => {
      state.isVestingEnabled = action.payload;
    },
    updateICOInfo: (state, action) => {
      return { ...state, ...action.payload };
    },
    setWhitelistStatus: (state, action) => {
      state.isWhitelisted = action.payload;
    },
    setCooldownTimeLeft: (state, action) => {
      state.cooldownTimeLeft = action.payload;
    },
    setTiers: (state, action) => {
      state.tiers = action.payload;
    },
    setVestingSchedule: (state, action) => {
      state.vestingSchedule = action.payload;
    },
    setTransactionHistory: (state, action) => {
      state.transactionHistory = action.payload;
    },
    updateTokenBalance: (state, action) => {
      if (typeof action.payload === 'function') {
        state.tokenBalance = action.payload(state.tokenBalance);
      } else {
        state.tokenBalance = action.payload;
      }
    },
    setReferralBonus: (state, action) => {
      state.referralBonus = action.payload;
    },
    setLockedTokens: (state, action) => {
      state.lockedTokens = action.payload;
    },
    setCurrentTokenPrice: (state, action) => {
      state.currentTokenPrice = action.payload;
    },
    setEstimatedTokens: (state, action) => {
      state.estimatedTokens = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactionHistory = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setICOStatus,
  setCooldownStatus,
  setVestingStatus,
  updateICOInfo,
  setWhitelistStatus,
  setCooldownTimeLeft,
  setTiers,
  setVestingSchedule,
  setTransactionHistory,
  updateTokenBalance,
  setReferralBonus,
  setLockedTokens,
  setCurrentTokenPrice,
  setEstimatedTokens,
} = icoSlice.actions;

export default icoSlice.reducer;

