import { createSlice } from '@reduxjs/toolkit';

const icoSlice = createSlice({
  name: 'ico',
  initialState: {
    status: {
      isActive: false,
      hasStarted: false,
      hasEnded: false,
      currentTime: '0',
      remainingTime: '0',
    },
    tokenPrice: '0',
    softCap: '0',
    hardCap: '0',
    totalRaised: '0',
    totalTokensSold: '0',
    minInvestment: '0',
    maxInvestment: '0',
    isLoading: false,
    error: null,
  },
  reducers: {
    updateICOStatus: (state, action) => {
      state.status = action.payload;
    },
    updateICOData: (state, action) => {
      return {
        ...state,
        ...action.payload,
        status: {
          ...state.status,
          ...action.payload.status
        }
      };
    },
  },
});

export const { updateICOStatus, updateICOData } = icoSlice.actions;
export default icoSlice.reducer;

