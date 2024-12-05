import React from 'react';
import { useSelector } from 'react-redux';
import Table from '../ui/Table';

const VestingSchedule = () => {
  const user = useSelector(state => state.user);
  const tokenBalance = user ? user.tokenBalance : 0;
  
  // This is mock data. In a real application, you would fetch this from your smart contract.
  const vestingSchedule = [
    { date: '2023-08-01', percentage: 25, released: true },
    { date: '2023-11-01', percentage: 25, released: false },
    { date: '2024-02-01', percentage: 25, released: false },
    { date: '2024-05-01', percentage: 25, released: false },
  ];

  const totalVested = vestingSchedule.reduce((acc, cur) => acc + (cur.released ? cur.percentage : 0), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Token Vesting Schedule</h2>
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span>Total Vested</span>
          <span>{totalVested}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${totalVested}%` }}></div>
        </div>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Date</Table.Head>
            <Table.Head>Percentage</Table.Head>
            <Table.Head>Amount</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {vestingSchedule.map((schedule, index) => (
            <Table.Row key={index}>
              <Table.Cell>{schedule.date}</Table.Cell>
              <Table.Cell>{schedule.percentage}%</Table.Cell>
              <Table.Cell>{((tokenBalance * schedule.percentage) / 100).toFixed(2)} tokens</Table.Cell>
              <Table.Cell>{schedule.released ? 'Released' : 'Locked'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default VestingSchedule;

