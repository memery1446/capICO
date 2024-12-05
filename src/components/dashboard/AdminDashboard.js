import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Settings, 
  Users, 
  Clock, 
  DollarSign,
  Shield,
  BarChart2,
  Lock
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  const tabs = [
    {
      id: 'general',
      label: 'General Settings',
      icon: Settings,
      component: GeneralSettings
    },
    {
      id: 'distribution',
      label: 'Distribution Model',
      icon: Clock,
      component: DistributionConfig
    },
    {
      id: 'pricing',
      label: 'Pricing Mechanism',
      icon: DollarSign,
      component: PricingConfig
    },
    {
      id: 'access',
      label: 'Access Control',
      icon: Shield,
      component: AccessControl
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart2,
      component: SaleAnalytics
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">ICO Administration</h1>
        
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              {tabs.find(t => t.id === activeTab)?.component()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

