import { configureStore } from '@reduxjs/toolkit';
import icoReducer from './icoSlice';
import accountReducer from './accountSlice';
import blockchainReducer from './blockchainSlice';
import userReducer from './userSlice';
import uiReducer from './uiSlice';
import actions from './actions';

const store = configureStore({
  reducer: {
    ico: icoReducer,
    account: accountReducer,
    blockchain: blockchainReducer,
    user: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: actions,
      },
    }),
});

export default store;

