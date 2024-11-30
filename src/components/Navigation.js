import React from 'react';
import { useSelector } from 'react-redux';
import { Wallet, Menu, X, Settings, BarChart2, Users, Shield } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { account } = useSelector((state) => state.account);
  const isAdmin = useSelector((state) => state.account.isAdmin);

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const menuItems = [
    { name: 'Dashboard', icon: BarChart2, href: '#dashboard' },
    { name: 'Buy Tokens', icon: Wallet, href: '#buy' },
    { name: 'Whitelist', icon: Shield, href: '#whitelist' },
    ...(isAdmin ? [
      { name: 'Admin', icon: Settings, href: '#admin' },
      { name: 'User Management', icon: Users, href: '#users' }
    ] : [])
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-semibold">CapICO</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* Wallet Connection Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full ${
              account ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>{account ? truncateAddress(account) : 'Not Connected'}</span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              ))}
              
              {/* Mobile Wallet Status */}
              <div className={`px-4 py-2 rounded-full ${
                account ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>{account ? truncateAddress(account) : 'Not Connected'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

