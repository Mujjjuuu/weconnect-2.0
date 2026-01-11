
import React from 'react';
import { Icons } from '../constants';
import { UserRole, NeuralAgent } from '../types';
import { isSupabaseConfigured } from '../services/supabase';
import { isAiReady } from '../services/geminiService';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSelectAgent?: (agent: NeuralAgent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const isCloudActive = isSupabaseConfigured();
  const isAiActive = isAiReady();

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Icons.Campaigns },
    { id: 'discover', label: 'Marketplace', icon: Icons.Discover },
    { id: 'matching', label: 'AI Match', icon: Icons.Robot },
    { id: 'ai_chat', label: 'AI Chat', icon: Icons.Robot },
    { id: 'profile', label: 'Identity & Assets', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { id: 'messages', label: 'Influencer Chat', icon: Icons.Messages },
    { id: 'wallet', label: 'Wallet', icon: Icons.Wallet },
  ];

  return (
    <div className={`${isCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-gray-100 h-full flex flex-col fixed left-0 top-0 pt-24 z-[90] transition-all duration-300 ease-in-out`}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-32 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-purple-600 z-[100] transition-transform hover:scale-110"
      >
        {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
      </button>

      <div className={`flex-1 px-4 space-y-1 mt-4 overflow-y-auto no-scrollbar pb-10`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4 px-6'} py-3.5 rounded-2xl transition-all group relative ${
              activeTab === item.id
                ? 'bg-purple-600 text-white font-black shadow-xl shadow-purple-100'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 font-bold'
            }`}
          >
            <div className={`transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`}>
              <item.icon />
            </div>
            {!isCollapsed && <span className="text-[11px] uppercase tracking-widest whitespace-nowrap">{item.label}</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[110]">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-50 transition-all duration-300">
        <div className={`p-3 rounded-[24px] text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${isCloudActive ? 'bg-gradient-to-br from-green-600 to-teal-600 shadow-green-100' : 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-100'}`}>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-150 transition-transform">
             {isAiActive ? <Icons.Robot /> : <Icons.Settings />}
          </div>
          <p className="text-[7px] font-black opacity-60 uppercase tracking-widest mb-0.5">Cloud State</p>
          <div className="flex items-center space-x-1.5">
            <div className={`w-1 h-1 rounded-full animate-pulse ${isCloudActive ? 'bg-green-300' : 'bg-white'}`}></div>
            <p className="text-[10px] font-black tracking-tight">{isCloudActive ? 'Verified' : 'Local Mode'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
