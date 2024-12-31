import { configureStore } from '@reduxjs/toolkit';
import icoReducer from '../features/ico/icoSlice';
import tokenReducer from '../features/token/tokenSlice';

export const store = configureStore({
  reducer: {
    ico: icoReducer,
    token: tokenReducer,
  },
});

