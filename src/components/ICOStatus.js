import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchICOStatus } from './icoSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ICOStatus() {
  const dispatch = useDispatch();
  const { status, loading, error } = useSelector((state) => state.ico);

  useEffect(() => {
    dispatch(fetchICOStatus());
    const interval = setInterval(() => {
      dispatch(fetchICOStatus());
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return <div className="text-center">Loading ICO status...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  const progressPercentage = Math.min((parseFloat(status.totalRaised) / parseFloat(status.hardCap)) * 100, 100);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ICO Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-semibold">
              {status.isActive ? 'Active' : status.hasEnded ? 'Ended' : 'Not Started'}
            </span>
          </div>
          {status.isActive && (
            <div className="flex justify-between">
              <span>Time Remaining:</span>
              <span className="font-semibold">
                {Math.floor(status.remainingTime / 86400)}d {Math.floor((status.remainingTime % 86400) / 3600)}h {Math.floor((status.remainingTime % 3600) / 60)}m
              </span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className="font-semibold">{progressPercentage.toFixed(2)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
          <div className="flex justify-between">
            <span>Total Raised:</span>
            <span className="font-semibold">{parseFloat(status.totalRaised).toFixed(2)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Soft Cap:</span>
            <span className="font-semibold">{parseFloat(status.softCap).toFixed(2)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Hard Cap:</span>
            <span className="font-semibold">{parseFloat(status.hardCap).toFixed(2)} ETH</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}