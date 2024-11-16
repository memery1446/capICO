import React from 'react'
import { useSelector } from 'react-redux'

export default function ICODashboard() {
  const { status, tokenPrice, softCap, hardCap, totalRaised, totalTokensSold, isLoading, error } = useSelector((state) => state.ico)

  if (isLoading) {
    return <div className="text-center">Loading ICO status...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">ICO Dashboard</h2>
      <div className="space-y-2">
        <div>
          <span>ICO Status: </span>
          <span className="font-semibold">
            {status.isActive ? 'Active' : status.hasEnded ? 'Ended' : 'Not Started'}
          </span>
        </div>
        <div>
          <span>Token Price: </span>
          <span className="font-semibold">{parseFloat(tokenPrice).toFixed(6)} ETH</span>
        </div>
        <div>
          <span>Total Raised: </span>
          <span className="font-semibold">{parseFloat(totalRaised).toFixed(2)} ETH</span>
        </div>
        <div>
          <span>Soft Cap: </span>
          <span className="font-semibold">{parseFloat(softCap).toFixed(2)} ETH</span>
        </div>
        <div>
          <span>Hard Cap: </span>
          <span className="font-semibold">{parseFloat(hardCap).toFixed(2)} ETH</span>
        </div>
        <div>
          <span>Tokens Sold: </span>
          <span className="font-semibold">{parseFloat(totalTokensSold).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
