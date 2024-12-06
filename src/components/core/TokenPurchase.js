import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { buyTokens, loadBlockchainData } from '../../redux/actions';
import { Card } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { Progress } from "../ui/Progress";
import { Slider } from "../ui/Slider";
import { AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';

const TokenPurchase = () => {
  const [amount, setAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dispatch = useDispatch();

  const { 
    tokenPrice, 
    minInvestment, 
    maxInvestment, 
    status,
    totalRaised,
    hardCap,
    softCap,
    totalTokensSold
  } = useSelector(state => state.ico);
  const { account, balance } = useSelector(state => state.account);
  const isLoading = useSelector(state => state.blockchain.isLoading);

  useEffect(() => {
    dispatch(loadBlockchainData());
  }, [dispatch]);

  useEffect(() => {
    const calculateEthAmount = () => {
      if (amount && tokenPrice) {
        const calculatedEthAmount = (parseFloat(amount) * parseFloat(tokenPrice)).toFixed(6);
        setEthAmount(calculatedEthAmount);
      } else {
        setEthAmount('');
      }
    };

    setIsCalculating(true);
    const timer = setTimeout(calculateEthAmount, 500);
    return () => clearTimeout(timer);
  }, [amount, tokenPrice]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setIsCalculating(true);
    }
  };

  const handleSliderChange = (value) => {
    setAmount(value[0].toFixed(6));
    setIsCalculating(true);
  };

  const handleMaxClick = () => {
    const maxTokens = Math.min(
      parseFloat(maxInvestment),
      parseFloat(balance) / parseFloat(tokenPrice),
      (parseFloat(hardCap) - parseFloat(totalRaised)) / parseFloat(tokenPrice)
    );
    setAmount(maxTokens.toFixed(6));
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    if (canPurchase) {
      setShowConfirmation(true);
    }
  };

  const confirmPurchase = async () => {
    try {
      await dispatch(buyTokens(amount));
      setAmount('');
      setShowConfirmation(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const cancelPurchase = () => {
    setShowConfirmation(false);
  };

  const tokenAmount = amount ? parseFloat(amount) : 0;
  const remainingToHardCap = parseFloat(hardCap) - parseFloat(totalRaised);
  const maxPossiblePurchase = Math.min(
    parseFloat(maxInvestment) || 0,
    (parseFloat(hardCap) - parseFloat(totalRaised)) / (parseFloat(tokenPrice) || 1)
  );

  const canPurchase = account && 
    parseFloat(balance) >= parseFloat(ethAmount) && 
    tokenAmount >= parseFloat(minInvestment) && 
    tokenAmount <= maxPossiblePurchase &&
    status?.isActive;

  const progressPercentage = (parseFloat(totalRaised) / parseFloat(hardCap)) * 100;

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Tokens</h2>
      {!status?.isActive && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <h3 className="font-semibold">ICO is not active</h3>
          <p>The ICO is currently not active. Please wait for the sale to begin.</p>
        </Alert>
      )}

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">ICO Progress</h4>
        <Progress value={progressPercentage} max={100} className="mb-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{totalRaised} ETH raised</span>
          <span>{hardCap} ETH goal</span>
        </div>
      </div>

      <form onSubmit={handlePurchase} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Amount
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount of tokens"
              disabled={isLoading || !status?.isActive}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={isLoading || !status?.isActive}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              MAX
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Slider
          </label>
          <Slider
            min={0}
            max={maxPossiblePurchase || 0}
            step={0.000001}
            value={[parseFloat(amount) || 0]}
            onValueChange={(value) => {
              setAmount(value[0].toFixed(6));
              setIsCalculating(true);
            }}
            disabled={isLoading || !status?.isActive}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Purchase Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Token Amount:</span>
              <span className="font-medium">
                {isCalculating ? '...' : `${tokenAmount.toFixed(6)} Tokens`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-medium">
                {isCalculating ? '...' : `${ethAmount} ETH`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Balance:</span>
              <span className="font-medium">{parseFloat(balance).toFixed(6)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Balance:</span>
              <span className="font-medium">
                {isCalculating ? '...' : `${(parseFloat(balance) - parseFloat(ethAmount)).toFixed(6)} ETH`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canPurchase || isLoading}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          <span>{isLoading ? 'Processing...' : 'Purchase Tokens'}</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>

        {!canPurchase && amount && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-semibold">Unable to purchase</h3>
            <p>
              {!account ? 'Please connect your wallet first' :
               !status?.isActive ? 'ICO is not active' :
               parseFloat(balance) < parseFloat(ethAmount) ? 'Insufficient balance' :
               tokenAmount < parseFloat(minInvestment) ? 'Amount below minimum' :
               tokenAmount > maxPossiblePurchase ? 'Amount above maximum' :
               'Invalid amount'}
            </p>
          </Alert>
        )}
      </form>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Purchase</h3>
            <p>Are you sure you want to purchase {tokenAmount.toFixed(6)} tokens for {ethAmount} ETH?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={cancelPurchase} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
              <button onClick={confirmPurchase} className="px-4 py-2 bg-blue-500 text-white rounded-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TokenPurchase;

