import { configureStore } from '@reduxjs/toolkit';
import icoReducer from './icoSlice';

export const store = configureStore({
  reducer: {
    ico: icoReducer,
  },
});

