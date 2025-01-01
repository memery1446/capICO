// src/store/slices/ico.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: {
    startTime: 0,
    endTime: 0,
    totalRaised: '0',
    softCap: '0',
    hardCap: '0',
    tokenPrice: '0',
    isFinalized: false,
    isDemoMode: true
  },
  userInfo: {
    isWhitelisted: false,
    tokenBalance: '0',
    distributions: []
  },
  loading: false,
  error: null
};

const icoSlice = createSlice({
  name: 'ico',
  initialState,
  reducers: {
    setICOStatus: (state, action) => {
      state.status = { ...state.status, ...action.payload };
    },
    setUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setICOStatus, setUserInfo, setLoading, setError } = icoSlice.actions;
export default icoSlice.reducer;

