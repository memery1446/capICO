import { createSlice } from '@reduxjs/toolkit';

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
};

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
} = icoSlice.actions;

export default icoSlice.reducer;

