import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { buyTokens } from '../redux/actions';

const FormWrapper = styled.form`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #043927;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #065d3e;
  }
`;

export default function PurchaseForm() {
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();
  const { currentPrice } = useSelector(state => state.ico);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(buyTokens(amount));
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter token amount"
      />
      <Button type="submit">Buy Tokens</Button>
      <p>Current Price: {currentPrice} ETH per token</p>
    </FormWrapper>
  );
}
