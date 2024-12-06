import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateICOParams, updateWhitelist } from '../../redux/actions';
import { Card } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { tokenPrice, softCap, hardCap, startTime, endTime } = useSelector(state => state.ico);
  
  const [formData, setFormData] = useState({
    tokenPrice: '',
    softCap: '',
    hardCap: '',
    startDate: '',
    endDate: '',
  });
  const [whitelistAddresses, setWhitelistAddresses] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFormData({
      tokenPrice: tokenPrice || '',
      softCap: softCap || '',
      hardCap: hardCap || '',
      startDate: startTime ? new Date(startTime * 1000).toISOString().slice(0, 16) : '',
      endDate: endTime ? new Date(endTime * 1000).toISOString().slice(0, 16) : '',
    });
  }, [tokenPrice, softCap, hardCap, startTime, endTime]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateICOParams({
      ...formData,
      startDate: new Date(formData.startDate).getTime() / 1000,
      endDate: new Date(formData.endDate).getTime() / 1000,
    }))
      .then(() => {
        setSuccessMessage('ICO parameters updated successfully');
        setErrorMessage('');
      })
      .catch((error) => {
        setErrorMessage(`Failed to update ICO parameters: ${error.message}`);
        setSuccessMessage('');
      });
  };

  const handleWhitelistUpdate = () => {
    const addresses = whitelistAddresses.split(',').map(addr => addr.trim());
    dispatch(updateWhitelist(addresses))
      .then(() => {
        setSuccessMessage('Whitelist updated successfully');
        setErrorMessage('');
        setWhitelistAddresses('');
      })
      .catch((error) => {
        setErrorMessage(`Failed to update whitelist: ${error.message}`);
        setSuccessMessage('');
      });
  };

return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
        {successMessage && (
          <Alert className="mb-4 bg-green-100 text-green-800" role="status">
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert className="mb-4 bg-red-100 text-red-800" role="alert">
            {errorMessage}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Parameter</TableHead>
                <TableHead scope="col">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <label htmlFor="tokenPrice">Token Price (ETH)</label>
                </TableCell>
                <TableCell>
                  <input
                    id="tokenPrice"
                    type="number"
                    value={formData.tokenPrice}
                    onChange={handleInputChange}
                    placeholder="0.01"
                    step="0.000000000000000001"
                    className="w-full px-3 py-2 border rounded-md"
                    aria-describedby="tokenPriceHelp"
                  />
                  <p id="tokenPriceHelp" className="text-xs text-gray-500 mt-1">
                    Enter the price for one token in ETH
                  </p>
                </TableCell>
              </TableRow>
              {/* ... (other form fields with similar accessibility improvements) */}
            </TableBody>
          </Table>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Update ICO Parameters"
          >
            Update ICO Parameters
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Whitelist Management</h3>
          <label htmlFor="whitelistAddresses" className="sr-only">Whitelist Addresses</label>
          <textarea
            id="whitelistAddresses"
            value={whitelistAddresses}
            onChange={(e) => setWhitelistAddresses(e.target.value)}
            placeholder="Enter comma-separated addresses to whitelist"
            rows={5}
            className="w-full px-3 py-2 border rounded-md mb-4"
            aria-describedby="whitelistHelp"
          />
          <p id="whitelistHelp" className="text-xs text-gray-500 mb-2">
            Enter Ethereum addresses separated by commas to add to the whitelist
          </p>
          <button 
            onClick={handleWhitelistUpdate}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Update Whitelist"
          >
            Update Whitelist
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AdminPanel;
