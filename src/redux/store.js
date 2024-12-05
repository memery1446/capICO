import { configureStore } from '@reduxjs/toolkit';
import icoReducer from './icoSlice';
import accountReducer from './accountSlice';
import blockchainReducer from './blockchainSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    ico: icoReducer,
    account: accountReducer,
    blockchain: blockchainReducer,
    user: userReducer,
  },
});

export default store;

