import React from 'react'
import { Provider } from 'react-redux'
import store from './redux/store'
import ICODashboard from './components/ICODashboard'

export default function App() {
return (
<Provider store={store}>
<div className="container mx-auto p-4">
<h1 className="text-3xl font-bold mb-6 text-center">`CapICO Frontend`</h1>
<ICODashboard />
</div>
</Provider>
)
}