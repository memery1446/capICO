import { configureStore } from '@reduxjs/toolkit';
import icoReducer from './icoSlice';
import accountReducer from './accountSlice';
import blockchainReducer from './blockchainSlice';
import userReducer from './userSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    ico: icoReducer,
    account: accountReducer,
    blockchain: blockchainReducer,
    user: userReducer,
    ui: uiReducer,
  },
});

export default store;

