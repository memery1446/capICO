import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import web3Service from '../../services/web3Service';

export const buyTokens = createAsyncThunk(
  'ico/buyTokens',
  async (amount, { rejectWithValue }) => {
    try {
      await web3Service.buyTokens(amount);
      return `Successfully purchased tokens for ${amount} ETH`;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const icoSlice = createSlice({
  name: 'ico',
  initialState: {
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buyTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(buyTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload;
      })
      .addCase(buyTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default icoSlice.reducer;

