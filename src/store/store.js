import { configureStore } from '@reduxjs/toolkit';
import icoReducer from './icoSlice';
import errorReducer from './errorSlice';
import pollingMiddleware from './pollingMiddleware';

export const store = configureStore({
  reducer: {
    ico: icoReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pollingMiddleware),
});

