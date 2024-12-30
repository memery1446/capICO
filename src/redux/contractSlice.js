// redux/contractSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: true,
  error: null,
  contracts: {
    token: null,
    ico: null
  },
  icoData: {
    tokenPrice: '0',
    softCap: '0',
    hardCap: '0',
    totalRaised: '0',
    totalTokensSold: '0',
    minInvestment: '0',
    maxInvestment: '0'
  }
};

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
    updateICOData: (state, action) => {
      state.icoData = { ...state.icoData, ...action.payload };
    }
  }
});

export const { setLoading, setError, setContracts, updateICOData } = contractSlice.actions;
export default contractSlice.reducer;