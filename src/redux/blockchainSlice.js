import { createSlice } from '@reduxjs/toolkit';

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: {
    isLoading: true,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setError } = blockchainSlice.actions;
export default blockchainSlice.reducer;
