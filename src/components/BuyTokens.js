// src/components/BuyTokens.js
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import web3Service from '../services/web3';

const BuyTokens = () => {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  useEffect(() => {
    const checkWhitelist = async () => {
      try {
        const address = await web3Service.getAddress();
        const whitelist = await web3Service.contracts.ico.whitelist(address);
        console.log('Whitelist check:', { address, isWhitelisted: whitelist });
        setIsWhitelisted(whitelist);
      } catch (err) {
        console.error('Whitelist check error:', err);
      }
    };
    checkWhitelist();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (!isWhitelisted) {
        throw new Error('Your address is not whitelisted');
      }

      const tx = await web3Service.buyTokens(amount);
      setSuccess(`Successfully purchased tokens! Transaction: ${tx.hash}`);
      setAmount('');
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Error purchasing tokens');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Buy Tokens
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {!isWhitelisted && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your address is not whitelisted
        </Alert>
      )}

      <TextField
        fullWidth
        label="Amount in ETH"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={processing || !isWhitelisted}
        InputProps={{
          inputProps: { 
            min: 0,
            step: "0.01"
          }
        }}
        sx={{ mb: 2 }}
      />

      <Button 
        fullWidth 
        variant="contained" 
        color="primary" 
        type="submit"
        disabled={processing || !amount || amount <= 0 || !isWhitelisted}
      >
        {processing ? 'Processing...' : 'Buy Tokens'}
      </Button>
    </Box>
  );
};

export default BuyTokens;

