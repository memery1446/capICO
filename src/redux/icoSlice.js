import { createSlice } from '@reduxjs/toolkit';

const icoSlice = createSlice({
  name: 'ico',
  initialState: {
    currentTier: 0,
    totalTokensSold: 0,
    softCap: 0,
    currentPrice: 0,
  },
  reducers: {
    setICOData: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setICOData } = icoSlice.actions;
export default icoSlice.reducer;
