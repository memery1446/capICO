import React from 'react';
import { Home, User, Clock, Settings } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">ICO Dashboard</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <User className="mr-2 h-4 w-4" />
                Account
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Clock className="mr-2 h-4 w-4" />
                Vesting
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

