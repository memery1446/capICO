import { configureStore } from "@reduxjs/toolkit"
import icoReducer from "./icoSlice"
import errorReducer from "./errorSlice"
import referralReducer from "./referralSlice"
import pollingMiddleware from "./pollingMiddleware"

export const store = configureStore({
  reducer: {
    ico: icoReducer,
    error: errorReducer,
    referral: referralReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pollingMiddleware),
})

console.log("Redux store configured with pollingMiddleware")

