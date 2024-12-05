import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { loadUserData } from '../../redux/actions';
import { CAPICO_ADDRESS, CAPICO_ABI } from '../../config';
import Table from '../ui/Table';

const UserAccount = () => {
  const dispatch = useDispatch();
  const { account, balance } = useSelector(state => state.account);
  const { tokenPrice } = useSelector(state => state.ico);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (account) {
      dispatch(loadUserData(account));
      fetchTokenBalance();
      fetchTransactionHistory();
    }
  }, [account, dispatch]);

  const fetchTokenBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);
      const balance = await contract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);
      const filter = contract.filters.Transfer(account, null);
      const events = await contract.queryFilter(filter);
      const txs = await Promise.all(events.map(async (event) => {
        const block = await event.getBlock();
        return {
          hash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          value: ethers.utils.formatEther(event.args.value),
          timestamp: new Date(block.timestamp * 1000).toLocaleString(),
        };
      }));
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">User Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Account Address</p>
            <p className="font-semibold break-all">{account}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ETH Balance</p>
            <p className="font-semibold">{parseFloat(balance).toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Balance</p>
            <p className="font-semibold">{parseFloat(tokenBalance).toFixed(4)} Tokens</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Value</p>
            <p className="font-semibold">{(parseFloat(tokenBalance) * parseFloat(tokenPrice)).toFixed(4)} ETH</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Transaction Hash</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>To</Table.Head>
              <Table.Head>Value</Table.Head>
              <Table.Head>Timestamp</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions.map((tx) => (
              <Table.Row key={tx.hash}>
                <Table.Cell className="font-medium">{tx.hash.slice(0, 10)}...</Table.Cell>
                <Table.Cell>{tx.from.slice(0, 10)}...</Table.Cell>
                <Table.Cell>{tx.to.slice(0, 10)}...</Table.Cell>
                <Table.Cell>{parseFloat(tx.value).toFixed(4)} Tokens</Table.Cell>
                <Table.Cell>{tx.timestamp}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default UserAccount;

