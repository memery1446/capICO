// src/redux/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    loading: {
      contract: false,
      wallet: false,
      purchase: false,
      whitelist: false,
      distribution: false,
    },
    errors: {
      contract: null,
      wallet: null,
      purchase: null,
      whitelist: null,
      distribution: null,
    },
    modals: {
      purchase: false,
      distribution: false,
      whitelist: false,
    },
    notifications: [],
  },
  reducers: {
    setLoading: (state, action) => {
      const { type, isLoading } = action.payload;
      state.loading[type] = isLoading;
    },
    setError: (state, action) => {
      const { type, error } = action.payload;
      state.errors[type] = error;
    },
    clearError: (state, action) => {
      state.errors[action.payload] = null;
    },
    toggleModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = !state.modals[modalName];
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  toggleModal,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;

