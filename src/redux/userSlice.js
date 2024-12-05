import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    tokenBalance: 0,
  },
  reducers: {
    setTokenBalance: (state, action) => {
      state.tokenBalance = action.payload;
    },
  },
});

export const { setTokenBalance } = userSlice.actions;
export default userSlice.reducer;

