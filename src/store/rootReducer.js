import { combineReducers } from '@reduxjs/toolkit';
import icoReducer from '../features/ico/icoSlice';
import tokenReducer from '../features/token/tokenSlice';
import contractsReducer from '../features/contracts/contractsSlice';

const rootReducer = combineReducers({
  ico: icoReducer,
  token: tokenReducer,
  contracts: contractsReducer,
});

export default rootReducer;

