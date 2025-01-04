import { createSlice } from '@reduxjs/toolkit';

const errorSlice = createSlice({
  name: 'error',
  initialState: {
    globalError: null,
  },
  reducers: {
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
  },
});

export const { setGlobalError, clearGlobalError } = errorSlice.actions;

export default errorSlice.reducer;


