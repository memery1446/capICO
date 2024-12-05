import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { buyTokens, loadBlockchainData } from '../../redux/actions';
import { Alert, AlertTitle, AlertDescription } from '../ui/Alert';
import { Calculator, CreditCard, ArrowRight, Info } from 'lucide-react';

const TokenPurchase = () => {
  const [amount, setAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
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

  // Calculated values
  const tokenAmount = amount ? parseFloat(amount) : 0;
  const ethCost = tokenAmount * parseFloat(tokenPrice || '0');
  const remainingToHardCap = parseFloat(hardCap || '0') - parseFloat(totalRaised || '0');
  const maxPossiblePurchase = Math.min(
    parseFloat(maxInvestment || '0'),
    remainingToHardCap / parseFloat(tokenPrice || '1')
  );

  const canPurchase = account && 
    parseFloat(balance || '0') >= ethCost && 
    tokenAmount >= parseFloat(minInvestment || '0') && 
    tokenAmount <= maxPossiblePurchase &&
    status?.isActive;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setIsCalculating(true);
      setTimeout(() => setIsCalculating(false), 300);
    }
  };

  const handleMaxClick = () => {
    const maxTokens = Math.min(
      maxPossiblePurchase,
      parseFloat(balance || '0') / parseFloat(tokenPrice || '1')
    );
    setAmount(maxTokens.toFixed(6));
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!canPurchase) return;

    try {
      await dispatch(buyTokens(tokenAmount));
      setAmount('');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const progressPercentage = (parseFloat(totalRaised) / parseFloat(hardCap)) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {!status?.isActive && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertTitle>ICO is not active</AlertTitle>
          <AlertDescription>
            The ICO is currently not active. Please wait for the sale to begin.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">ICO Progress</h3>
          <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>{totalRaised} ETH raised</span>
            <span>{hardCap} ETH goal</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Purchase Tokens</h3>
          <p className="text-gray-500 text-sm mt-1">
            Current price: {tokenPrice || '0'} ETH per token
          </p>
        </div>

        <form onSubmit={handlePurchase} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Amount
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount of tokens"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || !status?.isActive}
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                MAX
              </button>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Min: {minInvestment || '0'} tokens | Max: {maxPossiblePurchase.toFixed(6)} tokens
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Purchase Details</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Token Amount:</span>
                <span className="font-medium">
                  {isCalculating ? '...' : `${tokenAmount.toFixed(6)} Tokens`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost:</span>
                <span className="font-medium">
                  {isCalculating ? '...' : `${ethCost.toFixed(6)} ETH`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Balance:</span>
                <span className="font-medium">{parseFloat(balance || '0').toFixed(6)} ETH</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canPurchase || isLoading}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              canPurchase && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>{isLoading ? 'Processing...' : 'Purchase Tokens'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {!canPurchase && amount && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {!account ? 'Please connect your wallet first' :
               !status?.isActive ? 'ICO is not active' :
               parseFloat(balance || '0') < ethCost ? 'Insufficient balance' :
               tokenAmount < parseFloat(minInvestment || '0') ? 'Amount below minimum' :
               tokenAmount > maxPossiblePurchase ? 'Amount above maximum' :
               'Invalid amount'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TokenPurchase;

