import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  capICOAddress: null,
  tokenAddress: null,
};

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    setContractAddresses: (state, action) => {
      state.capICOAddress = action.payload.capICOAddress;
      state.tokenAddress = action.payload.tokenAddress;
    },
  },
});

export const { setContractAddresses } = contractsSlice.actions;

export default contractsSlice.reducer;

