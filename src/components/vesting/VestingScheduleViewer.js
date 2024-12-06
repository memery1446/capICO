import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVestingSchedule } from '../../redux/actions';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { Progress } from "../ui/Progress"
import { Lock, Unlock } from 'lucide-react';

const VestingScheduleViewer = () => {
  const dispatch = useDispatch();
  const { account } = useSelector((state) => state.account);
  //const { tokenBalance } = useSelector((state) => state.user);
  const [vestingSchedule, setVestingSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVestingSchedule = async () => {
      if (account) {
        setIsLoading(true);
        setError(null);
        try {
          const schedule = await dispatch(fetchVestingSchedule(account));
          setVestingSchedule(schedule);
        } catch (err) {
          setError('Failed to load vesting schedule. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadVestingSchedule();
  }, [account, dispatch]);

  const totalVested = vestingSchedule.reduce((acc, period) => acc + (period.released ? period.percentage : 0), 0);

  if (isLoading) {
    return <Card><CardContent>Loading vesting schedule...</CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent className="text-red-500">{error}</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Vesting Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Total Vested</span>
            <span>{totalVested}%</span>
          </div>
          <Progress value={totalVested} max={100} className="w-full" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Release Date</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vestingSchedule.map((period, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(period.releaseDate).toLocaleDateString()}</TableCell>
                <TableCell>{period.percentage}%</TableCell>
                <TableCell>{period.amount} Tokens</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {period.released ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-green-500">Released</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-500">Locked</span>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VestingScheduleViewer;

