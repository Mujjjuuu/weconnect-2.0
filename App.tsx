
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DiscoverFeed from './components/DiscoverFeed';
import AIAnalyzer from './components/AIAnalyzer';
import AIChatbot from './components/AIChatbot';
import MatchingSystem from './components/MatchingSystem';
import CampaignManager from './components/CampaignManager';
import Login from './components/Login';
import { UserRole, Campaign } from './types';
import { Icons } from './constants';
import { getCampaignForecast } from './services/geminiService';
import { supabase, seedInitialData, isSupabaseConfigured } from './services/supabase';

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Summer Launch', status: 'active', budget: '$2,500', progress: 60, deliverables: ['1x Reel', '2x Stories'], influencersCount: 4 },
  { id: '2', name: 'Valentine\'s Promo', status: 'completed', budget: '$1,200', progress: 100, deliverables: ['1x TikTok'], influencersCount: 2 },
  { id: '3', name: 'Eco-Friendly Line', status: 'draft', budget: '$5,000', progress: 10, deliverables: ['3x UGC Videos'], influencersCount: 0 },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>('brand');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [dbStatus, setDbStatus] = useState<'connected' | 'mock'>('mock');
  
  // Campaign Creation State
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', platform: 'TikTok', budget: '' });
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await seedInitialData();
      await fetchData();
    };
    init();
  }, [isLoggedIn]);

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setDbStatus('mock');
      setCampaigns(MOCK_CAMPAIGNS);
      return;
    }

    try {
      const { data: campaignsData, error } = await supabase.from('campaigns').select('*');
      if (error) {
        console.warn("WeConnect: DB connection limited. Using fallback data.");
        setDbStatus('mock');
        setCampaigns(MOCK_CAMPAIGNS);
        return;
      }
      setDbStatus('connected');
      if (campaignsData && campaignsData.length > 0) {
        setCampaigns(campaignsData);
      } else {
        setCampaigns(MOCK_CAMPAIGNS);
      }
    } catch (e) {
      setDbStatus('mock');
      setCampaigns(MOCK_CAMPAIGNS);
    }
  };

  const handleGetForecast = async () => {
    if (!newCampaign.name || !newCampaign.budget) return;
    setIsForecasting(true);
    setForecastResult(null);
    try {
      const forecast = await getCampaignForecast(newCampaign);
      setForecastResult(forecast);
    } catch (error) {
      console.error("Forecast failed", error);
    } finally {
      setIsForecasting(false);
    }
  };

  const handleLaunchCampaign = async () => {
    const campaignToAdd: Campaign = {
      id: Math.random().toString(),
      name: newCampaign.name,
      status: 'active',
      budget: newCampaign.budget,
      progress: 0,
      deliverables: [newCampaign.platform],
      influencersCount: 0
    };

    if (dbStatus === 'connected') {
      try {
        const { error } = await supabase.from('campaigns').insert([campaignToAdd]);
        if (!error) await fetchData();
      } catch (e) {
        console.error("DB Insert failed, updating locally.");
      }
    }
    
    // Always update locally for instant feedback
    setCampaigns(prev => [campaignToAdd, ...prev]);
    closeLaunchModal();
  };

  const closeLaunchModal = () => {
    setIsLaunchModalOpen(false);
    setForecastResult(null);
    setNewCampaign({ name: '', platform: 'TikTok', budget: '' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleLoginComplete = (selectedRole: UserRole, authenticatedUser: any) => {
    setRole(selectedRole);
    setUser(authenticatedUser);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginComplete={handleLoginComplete} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.email?.split('@')[0]}! 👋</h1>
                <p className="text-gray-500 mt-1">AI-driven insights for your {role} profile.</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${dbStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {dbStatus === 'connected' ? 'Live Cloud Sync' : 'Offline Mode'}
                </span>
                {role === 'brand' && (
                  <button 
                    onClick={() => setIsLaunchModalOpen(true)}
                    className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Icons.Campaigns />
                    <span>New Campaign</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-extrabold mb-4">Scale with WeConnect AI</h2>
                <p className="text-purple-100 text-lg mb-8 max-w-lg">
                  Leveraging Gemini models to predict viral trends and match you with the top 1% of content creators.
                </p>
                <button onClick={() => setActiveTab('matching')} className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform">
                  Explore Neural Matching
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Platform ROI', value: '4.2x', trend: '+12%', color: 'text-green-600' },
                { label: 'Active Projects', value: campaigns.length.toString(), trend: 'In progress', color: 'text-blue-600' },
                { label: 'AI Match Rate', value: '94%', trend: 'Very High', color: 'text-purple-600' },
                { label: 'Audience Reach', value: '1.2M', trend: '+50k this week', color: 'text-orange-600' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-2 font-semibold ${stat.color}`}>{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">Real-time Campaign Pulse</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs font-bold uppercase border-b pb-4">
                          <th className="pb-4">Name</th>
                          <th className="pb-4">Budget</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(c => (
                          <tr key={c.id}>
                            <td className="py-4 font-bold">{c.name}</td>
                            <td className="py-4">{c.budget}</td>
                            <td className="py-4 capitalize">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${c.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{c.status}</span>
                            </td>
                            <td className="py-4">
                              <div className="w-24 bg-gray-100 h-1.5 rounded-full"><div className="bg-purple-600 h-full" style={{width: `${c.progress}%`}}></div></div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <AIAnalyzer />
              </div>
              <div className="space-y-8">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
                    <Icons.Robot />
                  </div>
                  <h3 className="font-bold mb-2">AI Daily Tip</h3>
                  <p className="text-sm text-gray-500">Video content with duration under 30s is currently seeing 2x higher engagement in your niche.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'campaigns':
        return <CampaignManager />;
      case 'discover':
        return <DiscoverFeed />;
      case 'matching':
        return <MatchingSystem />;
      default:
        return <div className="text-center py-20 text-gray-400 font-bold">Module under AI synchronization...</div>;
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50 h-20 flex items-center px-8">
        <div className="flex items-center space-x-2 mr-12 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">WeConnect</span>
        </div>
        <div className="flex items-center ml-auto space-x-4">
          <button onClick={handleLogout} className="text-red-600 font-bold text-sm">Logout</button>
          <img src={`https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=random`} className="w-10 h-10 rounded-full" alt="User" />
        </div>
      </nav>

      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pl-64 pt-20 bg-[#f9fafb] min-h-screen px-8 pb-12">
        {renderContent()}
      </main>

      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-purple-600 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">New AI-Powered Campaign</h2>
              <button onClick={closeLaunchModal}><Icons.Close /></button>
            </div>
            <div className="p-8 space-y-6">
              <input type="text" placeholder="Campaign Name" className="w-full p-4 bg-gray-50 rounded-xl outline-none" onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} />
              <input type="text" placeholder="Budget" className="w-full p-4 bg-gray-50 rounded-xl outline-none" onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})} />
              <button onClick={handleGetForecast} className="w-full py-4 bg-purple-100 text-purple-700 rounded-xl font-bold">Get AI Forecast</button>
              {forecastResult && <div className="p-4 bg-gray-50 rounded-xl text-sm italic">{forecastResult}</div>}
              <button onClick={handleLaunchCampaign} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold">Launch to Marketplace</button>
            </div>
          </div>
        </div>
      )}

      <AIChatbot />
    </div>
  );
};

export default App;
