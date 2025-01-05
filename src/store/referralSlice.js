import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  referralBonus: '0',
  currentReferrer: '',
  isWalletConnected: false,
};

export const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setReferralBonus: (state, action) => {
      state.referralBonus = action.payload;
    },
    setCurrentReferrer: (state, action) => {
      state.currentReferrer = action.payload;
    },
    setWalletConnection: (state, action) => {
      state.isWalletConnected = action.payload;
    },
    resetReferralState: (state) => {
      state.referralBonus = '0';
      state.currentReferrer = '';
    },
  },
});

export const { setReferralBonus, setCurrentReferrer, setWalletConnection, resetReferralState } = referralSlice.actions;

export default referralSlice.reducer;

