
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
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Icons.Campaigns },
    { id: 'discover', label: 'Marketplace', icon: Icons.Discover },
    { id: 'matching', label: 'AI Match', icon: Icons.Robot },
    { id: 'profile', label: 'My Identity', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { id: 'messages', label: 'Messages', icon: Icons.Messages },
    { id: 'wallet', label: 'Wallet', icon: Icons.Wallet },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-100 h-full flex flex-col fixed left-0 top-0 pt-24 z-[90]">
      <div className="flex-1 px-6 space-y-2 mt-12">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group ${
              activeTab === item.id
                ? 'bg-purple-600 text-white font-black shadow-xl shadow-purple-100'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 font-bold'
            }`}
          >
            <div className={`transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`}>
              <item.icon />
            </div>
            <span className="text-[12px] uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="p-8 border-t border-gray-50">
        <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[32px] text-white shadow-2xl shadow-purple-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
             <Icons.Robot />
          </div>
          <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Status</p>
          <p className="text-sm font-black tracking-tight">Cloud Synced</p>
          <button className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white text-[9px] font-black uppercase tracking-[0.2em] py-3 rounded-xl transition-all">
            Secure Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
