import { createStore } from 'redux'

const initialState = {
ico: {
status: {
isActive: false,
hasStarted: false,
hasEnded: false,
currentTime: '0',
remainingTime: '0',
},
tokenPrice: '0',
softCap: '0',
hardCap: '0',
totalRaised: '0',
totalTokensSold: '0',
isLoading: false,
error: null,
}
}

function rootReducer(state = initialState, action) {
switch (action.type) {
default:
return state
}
}

const store = createStore(rootReducer)

export default store
