import React from 'react';
import { useSelector } from 'react-redux';
import { 
  LayoutGrid, 
  Wallet, 
  Timer, 
  Users, 
  Settings, 
  BarChart2,
  Shield 
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { isLoading } = useSelector(state => state.blockchain);
  const { account } = useSelector(state => state.account);

  const sidebarItems = [
    { 
      icon: LayoutGrid, 
      label: 'Overview', 
      href: '#overview',
      badge: null
    },
    { 
      icon: Wallet, 
      label: 'Buy Tokens', 
      href: '#buy',
      badge: null
    },
    { 
      icon: Timer, 
      label: 'Distribution', 
      href: '#distribution',
      badge: '2' // Example of notification badge
    },
    { 
      icon: Shield, 
      label: 'Whitelist', 
      href: '#whitelist',
      badge: null
    },
    { 
      icon: BarChart2, 
      label: 'Statistics', 
      href: '#stats',
      badge: null
    },
    { 
      icon: Users, 
      label: 'Community', 
      href: '#community',
      badge: null
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '#settings',
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-semibold text-lg">CapICO</span>
            </div>

            {/* Account Info */}
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="flex items-center space-x-3">
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="flex gap-6 pt-6">
          {/* Sidebar */}
          <aside className="w-64 hidden md:block">
            <div className="bg-white rounded-lg shadow-sm">
              <nav className="p-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item, index) => (
                    <li key={index}>
                      <a 
                        href={item.href}
                        className="flex items-center justify-between px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5 text-gray-500" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                children
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

