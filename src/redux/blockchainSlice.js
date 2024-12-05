import { createSlice } from '@reduxjs/toolkit';

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: {
    isLoading: true,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      console.log('setLoading called with:', action.payload);
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      console.log('setError called with:', action.payload);
      state.error = action.payload;
    },
  },
});

export const { setLoading, setError } = blockchainSlice.actions;
export default blockchainSlice.reducer;

