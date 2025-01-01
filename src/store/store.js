// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  ico: {
    isConnected: false,
    status: null,
    error: null
  }
};

const icoReducer = (state = initialState.ico, action) => {
  switch (action.type) {
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    ico: icoReducer
  }
});

