// src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  account: null,
  isConnected: false,
  balance: '0',
  tokenBalance: '0',
  vestingSchedule: [],
  isWhitelisted: false,
  role: 'user' // or 'admin'
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
      state.isConnected = !!action.payload;
    },
    setBalances: (state, action) => {
      const { eth, tokens } = action.payload;
      state.balance = eth;
      state.tokenBalance = tokens;
    },
    setVestingSchedule: (state, action) => {
      state.vestingSchedule = action.payload;
    },
    setWhitelisted: (state, action) => {
      state.isWhitelisted = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    resetUser: (state) => {
      return initialState;
    }
  }
});

export const { 
  setAccount, 
  setBalances, 
  setVestingSchedule, 
  setWhitelisted,
  setRole,
  resetUser 
} = userSlice.actions;
export default userSlice.reducer;

