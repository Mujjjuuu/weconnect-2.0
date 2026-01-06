
import React from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Icons.Campaigns },
    { id: 'discover', label: 'Discover', icon: Icons.Discover },
    { id: 'matching', label: 'AI Matching', icon: Icons.Robot },
    { id: 'messages', label: 'Messages', icon: Icons.Messages },
    { id: 'analytics', label: 'Analytics', icon: Icons.Analytics },
    { id: 'wallet', label: 'Wallet', icon: Icons.Wallet },
  ];

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col fixed left-0 top-0 pt-20">
      <div className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="p-4 border-t">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl">
          <Icons.Settings />
          <span>Settings</span>
        </button>
        <div className="mt-4 p-4 bg-purple-600 rounded-2xl text-white">
          <p className="text-xs font-medium opacity-80 mb-1">Current Plan</p>
          <p className="text-sm font-bold">Enterprise Pro</p>
          <button className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
