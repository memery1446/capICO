// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import contractsReducer from './slices/contracts';
import icoReducer from './slices/ico';

export const store = configureStore({
  reducer: {
    contracts: contractsReducer,
    ico: icoReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

