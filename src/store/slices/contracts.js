// src/store/slices/contracts.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  capICOAddress: null,
  tokenAddress: null,
  isInitialized: false,
  error: null
};

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    setContractAddresses: (state, action) => {
      state.capICOAddress = action.payload.capICOAddress;
      state.tokenAddress = action.payload.tokenAddress;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setContractAddresses, setInitialized, setError } = contractsSlice.actions;
export default contractsSlice.reducer;

