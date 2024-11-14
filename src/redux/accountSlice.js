import { createSlice } from '@reduxjs/toolkit';

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    account: '',
    balance: 0,
  },
  reducers: {
    setAccountData: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setAccountData } = accountSlice.actions;
export default accountSlice.reducer;
