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
      serializableCheck: false, // Add this if you're getting serialization warnings
    }),
      devTools: process.env.NODE_ENV !== 'production', // Explicitly enable DevTools
});

console.log('Initial State:', store.getState());
console.log('Redux Store Structure:', {
    ico: store.getState().ico,
    account: store.getState().account,
    blockchain: store.getState().blockchain,
    user: store.getState().user,
    ui: store.getState().ui
});

export default store;

