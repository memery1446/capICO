import { configureStore } from '@reduxjs/toolkit';
import blockchainReducer from './blockchainSlice';
import icoReducer from './icoSlice';
import accountReducer from './accountSlice';

export const store = configureStore({
  reducer: {
    blockchain: blockchainReducer,
    ico: icoReducer,
    account: accountReducer,
  },
});
