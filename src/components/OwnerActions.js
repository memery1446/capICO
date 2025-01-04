import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { setICOStatus, setCooldownStatus, setVestingStatus } from '../store/icoSlice';

const OwnerActions = ({ onActionComplete }) => {
  const dispatch = useDispatch();
  const { isActive, isCooldownEnabled, isVestingEnabled } = useSelector(state => state.ico);
  const [newWhitelistAddresses, setNewWhitelistAddresses] = useState('');
  const [isWhitelisting, setIsWhitelisting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchContractStates();
  }, []);

  const fetchContractStates = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);
      const [active, cooldown, vesting] = await Promise.all([
        contract.isActive(),
        contract.cooldownEnabled(),
        contract.vestingEnabled()
      ]);
      dispatch(setICOStatus(active));
      dispatch(setCooldownStatus(cooldown));
      dispatch(setVestingStatus(vesting));
    } catch (error) {
      console.error("Error fetching contract states:", error);
    }
  };

  const handleAction = async (action, ...args) => {
    setError('');
    setSuccessMessage('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
      let tx;
      switch (action) {
        case 'toggleActive':
          tx = await contract.toggleActive();
          await tx.wait();
          dispatch(setICOStatus(!isActive));
          break;
        case 'toggleCooldown':
          tx = await contract.toggleCooldown();
          await tx.wait();
          dispatch(setCooldownStatus(!isCooldownEnabled));
          break;
        case 'toggleVesting':
          tx = await contract.toggleVesting();
          await tx.wait();
          dispatch(setVestingStatus(!isVestingEnabled));
          break;
        case 'updateWhitelist':
          setIsWhitelisting(true);
          tx = await contract.updateWhitelist(args[0], true);
          await tx.wait();
          break;
        default:
          throw new Error('Invalid action');
      }
      console.log(`${action} transaction completed:`, tx.hash);
      setSuccessMessage(`${action} completed successfully`);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setError(`Failed to perform ${action}. Please try again.`);
    } finally {
      if (action === 'updateWhitelist') setIsWhitelisting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Owner Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('toggleActive')}
          className="btn btn-primary"
        >
          {isActive ? 'Pause' : 'Resume'} ICO
        </button>
        <button
          onClick={() => handleAction('toggleCooldown')}
          className="btn btn-secondary"
        >
          {isCooldownEnabled ? 'Disable' : 'Enable'} Cooldown
        </button>
        <button
          onClick={() => handleAction('toggleVesting')}
          className="btn btn-info"
        >
          {isVestingEnabled ? 'Disable' : 'Enable'} Vesting
        </button>
        <div>
          <input
            type="text"
            value={newWhitelistAddresses}
            onChange={(e) => setNewWhitelistAddresses(e.target.value)}
            placeholder="Enter addresses to whitelist (comma-separated)"
            className="form-control mb-2"
          />
          <button
            onClick={() => handleAction('updateWhitelist', newWhitelistAddresses.split(',').map(addr => addr.trim()))}
            disabled={isWhitelisting}
            className="btn btn-warning"
          >
            {isWhitelisting ? 'Whitelisting...' : 'Whitelist Addresses'}
          </button>
        </div>
      </div>
      {error && <p className="text-danger mt-2">{error}</p>}
      {successMessage && <p className="text-success mt-2">{successMessage}</p>}
    </div>
  );
};

export default OwnerActions;

