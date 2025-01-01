import React, { useState } from 'react';
import { Button, TextField, Typography, Box } from '@mui/material';
import web3Service from '../../services/web3Service';

const WhitelistManager = () => {
  const [addresses, setAddresses] = useState('');
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const addressList = addresses.split(',').map(addr => addr.trim());
      await web3Service.updateWhitelist(addressList, status);
      setMessage(`Successfully ${status ? 'added' : 'removed'} ${addressList.length} address(es) ${status ? 'to' : 'from'} the whitelist.`);
      setAddresses('');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Whitelist
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Addresses (comma-separated)"
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          margin="normal"
        />
        <Box mt={2} mb={2}>
          <Button
            variant={status ? "contained" : "outlined"}
            color="primary"
            onClick={() => setStatus(true)}
          >
            Add to Whitelist
          </Button>
          <Button
            variant={!status ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setStatus(false)}
            style={{ marginLeft: '10px' }}
          >
            Remove from Whitelist
          </Button>
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
      {message && (
        <Typography color={message.startsWith('Error') ? 'error' : 'success'} mt={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default WhitelistManager;


