import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useICOStatus } from '../../hooks/useICOStatus';
import { 
  Users, 
  Clock,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { Card } from "../ui/Card";

// Admin Components
const WhitelistManager = ({ contract }) => {
  const [addresses, setAddresses] = useState('');
  
  const handleWhitelist = async () => {
    if (!addresses.trim()) return;
    const addressList = addresses.split(',').map(addr => addr.trim());
    try {
      await contract.updateWhitelist(addressList, true);
      setAddresses('');
    } catch (error) {
      console.error('Whitelist update failed:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Whitelist Management</h3>
      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter addresses (comma separated)"
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
        rows="4"
      />
      <button
        onClick={handleWhitelist}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add to Whitelist
      </button>
    </Card>
  );
};

const ICOControls = ({ contract }) => {
  const handlePause = async () => {
    try {
      await contract.pause();
    } catch (error) {
      console.error('Pause failed:', error);
    }
  };

  const handleUnpause = async () => {
    try {
      await contract.unpause();
    } catch (error) {
      console.error('Unpause failed:', error);
    }
  };

  const handleFinalize = async () => {
    try {
      await contract.finalize();
    } catch (error) {
      console.error('Finalization failed:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">ICO Controls</h3>
      <div className="space-x-4">
        <button
          onClick={handlePause}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Pause ICO
        </button>
        <button
          onClick={handleUnpause}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Unpause ICO
        </button>
        <button
          onClick={handleFinalize}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Finalize ICO
        </button>
      </div>
    </Card>
  );
};

const AdminStats = () => {
  const { contracts } = useSelector(state => state.contract);
  const {
    totalRaised,
    totalTokensSold,
    softCap,
    hardCap,
    isActive,
    timeRemaining,
    hasEnded
  } = useICOStatus(contracts?.ico);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">ICO Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Raised</p>
          <p className="text-xl font-bold">{totalRaised} ETH</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tokens Sold</p>
          <p className="text-xl font-bold">{totalTokensSold}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Soft Cap Status</p>
          <p className="text-xl font-bold">
            {parseFloat(totalRaised) >= parseFloat(softCap) ? 'Reached' : 'Not Reached'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hard Cap Status</p>
          <p className="text-xl font-bold">
            {parseFloat(totalRaised) >= parseFloat(hardCap) ? 'Reached' : 'Not Reached'}
          </p>
        </div>
      </div>
    </Card>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const { contracts } = useSelector(state => state.contract);
  
  const tabs = [
    {
      id: 'stats',
      label: 'Statistics',
      icon: Clock,
      component: AdminStats
    },
    {
      id: 'whitelist',
      label: 'Whitelist',
      icon: Users,
      component: () => <WhitelistManager contract={contracts?.ico} />
    },
    {
      id: 'controls',
      label: 'Controls',
      icon: Settings,
      component: () => <ICOControls contract={contracts?.ico} />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ICO Administration</h1>
        <ShieldCheck className="h-8 w-8 text-blue-500" />
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg mb-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {tabs.find(t => t.id === activeTab)?.component()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

