// CompleteDashboard.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WalletConnection from './WalletConnection';
import AccountInfo from './AccountInfo';
import PurchaseForm from './PurchaseForm';
import DistributionClaim from './DistributionClaim';
import RefundClaim from './RefundClaim';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary';
import Navigation from './Navigation';
import Buy from './Buy';
import { 
  LineChart, Line, PieChart, Pie, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { 
  AlertCircle, Award, Users, Wallet, Clock, 
  Target, Coins, Settings, ChevronDown 
} from 'lucide-react';
import { loadBlockchainData, buyTokens } from '../redux/actions';
import { setLoading, setError } from '../redux/blockchainSlice';
import { updateICOStatus, updateICOData } from '../redux/icoSlice';

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent = ({ children }) => <div>{children}</div>;

const Alert = ({ children, className = '' }) => (
  <div className={`p-4 rounded-lg border ${className}`}>{children}</div>
);
const AlertTitle = ({ children }) => <h4 className="font-semibold mb-1">{children}</h4>;
const AlertDescription = ({ children }) => <p>{children}</p>;

const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div 
      className="bg-blue-600 h-2.5 rounded-full" 
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const Tabs = ({ children, value, onValueChange }) => (
  <div className="space-y-4">{children}</div>
);

const TabsList = ({ children }) => (
  <div className="flex space-x-2 border-b">{children}</div>
);

const TabsTrigger = ({ children, value, onValueChange }) => (
  <button 
    className="px-4 py-2 hover:bg-gray-100 rounded-t-lg"
    onClick={() => onValueChange(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value: tabValue, activeValue }) => (
  <div className={tabValue === activeValue ? 'block' : 'hidden'}>{children}</div>
);

const CompleteDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get state from your Redux store
  const { account, balance, isAdmin } = useSelector(state => state.account);
  const { isLoading, error } = useSelector(state => state.blockchain);
  const { 
    status,
    tokenPrice,
    softCap,
    hardCap,
    totalRaised,
    totalTokensSold,
    currentTier,
    whitelistRequired
  } = useSelector(state => state.ico);

  // Derived state
  const icoStatus = status.isActive ? 'Active' : status.hasEnded ? 'Ended' : 'Not Started';
  
  // Sample data for charts
  const contributionHistory = [
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-02', value: 25 },
    { date: '2024-01-03', value: 45 },
    { date: '2024-01-04', value: 60 },
    { date: '2024-01-05', value: 85 },
  ];

  const distributionData = [
    { name: 'Public Sale', value: 40 },
    { name: 'Team', value: 20 },
    { name: 'Advisors', value: 15 },
    { name: 'Treasury', value: 25 }
  ];

  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(loadBlockchainData());
      } catch (err) {
        dispatch(setError(err.message));
      }
    };

    if (account) {
      init();
    }
  }, [dispatch, account]);

  const handlePauseICO = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(updateICOStatus({ isActive: !status.isActive }));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFinalizeICO = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(updateICOStatus({ hasEnded: true }));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorBoundary error={error} />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="container mx-auto px-4 py-6">
          {/* Wallet Connection Status */}
          <div className="mb-6">
            <WalletConnection />
            {account && <AccountInfo />}
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview" onValueChange={setActiveTab}>Overview</TabsTrigger>
              <TabsTrigger value="purchase" onValueChange={setActiveTab}>Purchase Tokens</TabsTrigger>
              <TabsTrigger value="claim" onValueChange={setActiveTab}>Claim & Refund</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" onValueChange={setActiveTab}>Admin Controls</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" activeValue={activeTab}>
              <div className="space-y-6">
                {/* Status Alert */}
                <Alert className={`${icoStatus === 'Active' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>ICO Status: {icoStatus}</AlertTitle>
                  </div>
                  <AlertDescription>
                    Current Phase: Tier {currentTier} | 
                    Whitelist: {whitelistRequired ? 'Required' : 'Not Required'}
                  </AlertDescription>
                </Alert>

                {/* Core Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Token Price</CardTitle>
                        <Coins className="h-4 w-4 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tokenPrice} ETH</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Total Raised</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalRaised} ETH</div>
                      <Progress value={(totalRaised / hardCap) * 100} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Soft/Hard Cap</CardTitle>
                        <Target className="h-4 w-4 text-purple-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {softCap}/{hardCap} ETH
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Tokens Sold</CardTitle>
                        <Award className="h-4 w-4 text-red-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalTokensSold}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contribution History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <LineChart
                          width={500}
                          height={300}
                          data={contributionHistory}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" name="ETH Contributed" />
                        </LineChart>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Token Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <PieChart width={400} height={300}>
                          <Pie
                            data={distributionData}
                            cx={200}
                            cy={150}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="purchase" activeValue={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <Buy />
                  <PurchaseForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claim" activeValue={activeTab}>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DistributionClaim />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Claim Refund</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RefundClaim />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" activeValue={activeTab}>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <button
                          onClick={handlePauseICO}
                          className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded"
                        >
                          {status.isActive ? 'Pause ICO' : 'Resume ICO'}
                        </button>
                        <button
                          onClick={handleFinalizeICO}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded"
                        >
                          Finalize ICO
                        </button>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Whitelist Management</h3>
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">
                            Whitelist management functionality will be implemented here...
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Tier Management</h3>
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">
                            Tier management functionality will be implemented here...
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default CompleteDashboard;

