// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import contractReducer from './contractSlice';
import userReducer from './userSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    contract: contractReducer,
    user: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['contract/setContracts'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.ico', 'payload.token'],
        // Ignore these paths in the state
        ignoredPaths: ['contract.contracts.ico', 'contract.contracts.token'],
      },
    }),
});

export default store;

