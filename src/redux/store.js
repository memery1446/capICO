import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './accountSlice';
import blockchainReducer from './blockchainSlice';
import icoReducer from './icoSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    account: accountReducer,
    blockchain: blockchainReducer,
    ico: icoReducer,
    ui: uiReducer
  }
});

export default store;
