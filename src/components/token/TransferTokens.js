import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { transferTokens } from '../../features/token/tokenSlice';

const TransferTokens = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(transferTokens({ recipient, amount }));
    setRecipient('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Transfer Tokens</h2>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount of tokens"
        required
      />
      <button type="submit">Transfer</button>
    </form>
  );
};

export default TransferTokens;

