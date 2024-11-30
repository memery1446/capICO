import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { 
  AlertCircle, 
  Calculator, 
  CreditCard,
  ArrowRight,
  Info
} from 'lucide-react';


const PurchaseForm = () => {
  const [amount, setAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { 
    tokenPrice,
    minInvestment,
    maxInvestment,
    status,
    whitelistRequired 
  } = useSelector(state => state.ico);
  const { account, balance } = useSelector(state => state.account);

  // Calculated values
  const tokenAmount = amount ? parseFloat(amount) : 0;
  const ethCost = tokenAmount * parseFloat(tokenPrice);
  const canPurchase = account && 
    parseFloat(balance) >= ethCost && 
    tokenAmount >= parseFloat(minInvestment) && 
    tokenAmount <= parseFloat(maxInvestment);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setIsCalculating(true);
      // Simulate calculation delay for better UX
      setTimeout(() => setIsCalculating(false), 300);
    }
  };

  const handleMaxClick = () => {
    const maxTokens = Math.min(
      parseFloat(maxInvestment),
      parseFloat(balance) / parseFloat(tokenPrice)
    );
    setAmount(maxTokens.toString());
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!status.isActive && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>ICO is not active</AlertTitle>
          <AlertDescription>
            Please wait for the ICO to start before making a purchase.
          </AlertDescription>
        </Alert>
      )}

      {whitelistRequired && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>Whitelist Required</AlertTitle>
          <AlertDescription>
            This phase requires whitelist approval. Please verify your status before purchasing.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Form Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Purchase Tokens</h3>
          <p className="text-gray-500 text-sm mt-1">
            Current price: {tokenPrice} ETH per token
          </p>
        </div>

        {/* Main Form */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
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
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                MAX
              </button>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Min: {minInvestment} tokens | Max: {maxInvestment} tokens
            </div>
          </div>

          {/* Cost Calculator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Cost Calculator</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Token Amount:</span>
                <span className="font-medium">
                  {isCalculating ? '...' : `${tokenAmount.toFixed(2)} Tokens`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">
                  {isCalculating ? '...' : `${ethCost.toFixed(4)} ETH`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Balance:</span>
                <span className="font-medium">{balance} ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            disabled={!canPurchase || !status.isActive}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              canPurchase && status.isActive
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Purchase Tokens</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          {!canPurchase && amount && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {!account ? 'Please connect your wallet first' :
               parseFloat(balance) < ethCost ? 'Insufficient balance' :
               tokenAmount < parseFloat(minInvestment) ? 'Amount below minimum' :
               tokenAmount > parseFloat(maxInvestment) ? 'Amount above maximum' :
               'Invalid amount'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;

