import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DiscoverFeed from './components/DiscoverFeed';
import AIAnalyzer from './components/AIAnalyzer';
import AIChatbot from './components/AIChatbot';
import MatchingSystem from './components/MatchingSystem';
import CampaignManager from './components/CampaignManager';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import ProfileView from './components/ProfileView';
import PublicProfileView from './components/PublicProfileView';
import WalletView from './components/WalletView';
import MessagesView from './components/MessagesView';
import { UserRole, Campaign, UserProfile, Profile, Influencer } from './types';
import { Icons, BrandLogo } from './constants';
import { getCampaignForecast, isAiReady } from './services/geminiService';
import { supabase, seedInitialData, isSupabaseConfigured, testConnection } from './services/supabase';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false);
  const [isCreateEntityOpen, setIsCreateEntityOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCloudVerified, setIsCloudVerified] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', platform: 'TikTok', budget: '' });
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<string | null>(null);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [newEntity, setNewEntity] = useState({ 
    fullName: '', 
    role: 'brand' as UserRole, 
    bio: '', 
    location: '',
    website: '',
    industry: 'Technology' 
  });

  const activeProfile = useMemo(() => {
    if (!user || !user.entities || user.entities.length === 0) return null;
    return user.entities.find(e => e.id === user.activeEntityId) || user.entities[0];
  }, [user?.activeEntityId, user?.entities]);

  const initCloud = async () => {
    setLoading(true);
    await seedInitialData();
    const verified = await testConnection();
    setIsCloudVerified(verified);
    if (verified) {
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 5000);
      if (view === 'app' && user && activeProfile) {
        fetchUserCampaigns();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initCloud().catch(() => {});

    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [view, user?.id]);

  const fetchUserCampaigns = async () => {
    if (!user || !activeProfile || !supabase || !isCloudVerified) {
      setCampaigns([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .or(`brand_id.eq.${activeProfile.id},influencers_ids.cs.{${activeProfile.id}}`)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCampaigns(data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          status: (c.status as any) || 'active',
          budget: c.budget,
          progress: c.progress || 0,
          deliverables: c.deliverables || [],
          influencersCount: c.influencers_count || 0,
          brandId: c.brand_id
        })));
      }
    } catch (e) {
      console.warn("App: Cloud fetch failed, switching to local state.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginComplete = (authenticatedUser: any, selectedRole: UserRole) => {
    const initialProfile: Profile = {
      id: authenticatedUser.id,
      fullName: authenticatedUser.email.split('@')[0],
      email: authenticatedUser.email,
      avatarUrl: `https://ui-avatars.com/api/?name=${authenticatedUser.email.split('@')[0]}&background=7C3AED&color=fff`,
      bio: `Primary ${selectedRole} profile.`,
      role: selectedRole,
      location: 'Remote'
    };

    setUser({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      fullName: initialProfile.fullName,
      activeEntityId: initialProfile.id,
      entities: [initialProfile]
    });
    setView('app');
  };

  const handleCreateNewEntity = () => {
    if (!user) return;
    const entityId = generateUUID();
    const entityToAdd: Profile = {
      id: entityId,
      fullName: newEntity.fullName,
      email: user.email,
      avatarUrl: `https://ui-avatars.com/api/?name=${newEntity.fullName}&background=${newEntity.role === 'brand' ? '7C3AED' : 'EC4899'}&color=fff`,
      bio: newEntity.bio,
      role: newEntity.role,
      location: newEntity.location,
      website: newEntity.website,
      categories: [newEntity.industry]
    };

    setUser(prev => prev ? ({
      ...prev,
      entities: [...prev.entities, entityToAdd],
      activeEntityId: entityId
    }) : null);

    setIsCreateEntityOpen(false);
    setIsEntityMenuOpen(false);
    setNewEntity({ fullName: '', role: 'brand', bio: '', location: '', website: '', industry: 'Technology' });
    setActiveTab('dashboard');
  };

  const switchActiveEntity = (id: string) => {
    setUser(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        activeEntityId: id 
      };
    });
    setIsEntityMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setActiveTab('dashboard');
  };

  const handleLaunchCampaign = async () => {
    if (!user || !activeProfile) return;
    const campaignId = generateUUID();
    const campaignToAdd = {
      id: campaignId,
      name: newCampaign.name,
      status: 'active',
      budget: newCampaign.budget,
      progress: 0,
      deliverables: [newCampaign.platform],
      influencersCount: 0,
      brandId: activeProfile.id
    };

    setCampaigns(prev => [campaignToAdd as any, ...prev]);
    setIsLaunchModalOpen(false);
    setForecastResult(null);
    setNewCampaign({ name: '', platform: 'TikTok', budget: '' });
    setActiveTab('campaigns');
  };

  const handleGetForecast = async () => {
    if (!newCampaign.name) return;
    setIsForecasting(true);
    setForecastResult(null);
    try {
      const forecast = await getCampaignForecast(newCampaign);
      setForecastResult(forecast);
    } catch (error) {
      setForecastResult("Forecast engine is currently recalibrating.");
    } finally {
      setIsForecasting(false);
    }
  };

  const handleSecureDeal = () => {
    if (!user) setView('login');
    else setActiveTab('messages');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setIsProfileDropdownOpen(false);
  };

  if (view === 'landing') return <LandingPage onEnterLogin={() => setView('login')} onEnterExplore={() => { setView('app'); setActiveTab('discover'); }} />;
  if (view === 'login' || view === 'signup') return <Login onLoginComplete={handleLoginComplete} onCancel={() => setView('landing')} initialMode={view === 'signup' ? 'signup' : 'login'} />;

  const renderContent = () => {
    if (!user || !activeProfile) return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
    const role = activeProfile.role;

    if (activeTab === 'public_profile' && selectedInfluencer) {
        return <PublicProfileView 
                  influencer={selectedInfluencer} 
                  onBack={() => setActiveTab('discover')} 
                  onSecureDeal={handleSecureDeal}
               />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12 max-w-6xl mx-auto py-12 animate-in fade-in duration-1000">
             {showSyncSuccess && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-8 py-4 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-12 duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span>Neural Cloud Handshake Complete</span>
                  </div>
                </div>
             )}

             {!isCloudVerified && (
               <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 flex items-center justify-between mb-8 shadow-sm">
                 <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                     <Icons.Settings />
                   </div>
                   <div>
                     <p className="text-amber-900 font-black text-xs uppercase tracking-widest">Developer Note: Demo Mode</p>
                     <p className="text-amber-700 text-[11px] font-medium">Add <code className="bg-amber-200/50 px-1 rounded">SUPABASE_ANON_KEY</code> and <code className="bg-amber-200/50 px-1 rounded">API_KEY</code> to GitHub Secrets to go live.</p>
                   </div>
                 </div>
                 <div className="flex space-x-4">
                   <button 
                    onClick={initCloud}
                    className="text-[10px] bg-amber-200/50 hover:bg-amber-200 px-4 py-2 rounded-xl font-black uppercase text-amber-900 tracking-widest transition-all"
                   >
                     Retry Sync
                   </button>
                   <a href="https://github.com/features/actions" target="_blank" className="text-[10px] font-black uppercase text-amber-900 underline tracking-widest flex items-center">Setup Guide</a>
                 </div>
               </div>
             )}

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome, {activeProfile.fullName}.</h1>
                <div className="relative">
                  <button 
                    onClick={() => setIsEntityMenuOpen(!isEntityMenuOpen)}
                    className="flex items-center space-x-2 text-gray-500 mt-1 font-black text-xs uppercase tracking-widest hover:text-purple-600 transition-colors"
                  >
                    <span>Managing {role === 'brand' ? 'Brand' : 'Influencer'}: {activeProfile.fullName}</span>
                    <Icons.ChevronDown />
                  </button>
                  
                  {isEntityMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-[200] animate-in slide-in-from-top-4 duration-300">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-4">Switch Identity</p>
                      <div className="space-y-1">
                        {user.entities.map(e => (
                          <button 
                            key={e.id}
                            onClick={() => switchActiveEntity(e.id)}
                            className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${user.activeEntityId === e.id ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50 text-gray-600'}`}
                          >
                            <img src={e.avatarUrl} className="w-8 h-8 rounded-xl" alt="" />
                            <div className="text-left">
                              <p className="font-black text-xs">{e.fullName}</p>
                              <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">{e.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <button 
                          onClick={() => setIsCreateEntityOpen(true)}
                          className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                        >
                          <Icons.Plus />
                          <span>Create Brand</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {role === 'brand' && (
                  <button onClick={() => setIsLaunchModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center space-x-3 shadow-2xl shadow-purple-200 active:scale-95">
                    <Icons.Campaigns />
                    <span>New Campaign</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-[64px] p-16 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 mb-8">
                  <div className={`w-2 h-2 ${isCloudVerified ? 'bg-green-400' : 'bg-amber-400'} rounded-full animate-pulse`}></div>
                  <span>WeConnect Live Hub {isCloudVerified ? '(Cloud Connected)' : '(Local Access)'}</span>
                </div>
                <h2 className="text-5xl font-black mb-6 tracking-tight">Your Business Hub.</h2>
                <p className="text-purple-100 text-lg mb-10 font-medium opacity-90 leading-relaxed max-w-xl">
                  Currently active as <span className="font-black text-white">{activeProfile.fullName}</span>. Switch between your brands at any time using the selector above.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setActiveTab('matching')} className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95">
                    AI Match Now
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Role', value: role.toUpperCase(), trend: 'Identity Verified', color: 'text-purple-600' },
                { label: 'Live Campaigns', value: campaigns.length.toString(), trend: 'Active', color: 'text-blue-600' },
                { label: 'Entity Level', value: 'ENTERPRISE', trend: 'Neural Pro', color: 'text-green-600' },
                { label: 'Cloud Handshake', value: isCloudVerified ? 'VERIFIED' : 'LOCAL', trend: isCloudVerified ? 'Live Sync' : 'Demo State', color: isCloudVerified ? 'text-green-600' : 'text-amber-600' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                  {stat.label === 'Cloud Handshake' && isCloudVerified && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  )}
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                  <p className={`text-xs mt-3 font-bold ${stat.color}`}>{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <CampaignManager sharedCampaigns={campaigns} onUpdateCampaigns={(newList) => setCampaigns(newList)} />
              </div>
              <div className="space-y-12">
                <AIChatbot />
              </div>
            </div>
          </div>
        );
      case 'campaigns':
        return <CampaignManager sharedCampaigns={campaigns} onUpdateCampaigns={(newList) => setCampaigns(newList)} />;
      case 'discover':
        return <DiscoverFeed onSelectInfluencer={(inf) => { setSelectedInfluencer(inf); setActiveTab('public_profile'); }} onSecureDeal={handleSecureDeal} />;
      case 'matching':
        return <MatchingSystem />;
      case 'profile':
        return <ProfileView 
                  user={user} 
                  activeEntityId={user.activeEntityId} 
                  onUpdate={(updated) => {
                    setUser(prev => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        entities: prev.entities.map(e => e.id === updated.id ? updated : e)
                      };
                    });
                  }} 
               />;
      case 'wallet':
        return <WalletView user={user} />;
      case 'messages':
        return <MessagesView user={user} />;
      default:
        return <div className="text-center py-40 text-gray-400 font-bold uppercase tracking-widest">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="neural-mesh"></div>

      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-[100] h-20 flex items-center px-10">
        <div className="flex items-center space-x-4 mr-16 cursor-pointer group" onClick={() => { if (user) setActiveTab('dashboard'); else setView('landing'); }}>
          <div className="group-hover:scale-105 transition-all">
            <BrandLogo size="md" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">WeConnect</span>
        </div>
        
        <div className="flex items-center ml-auto space-x-8">
          {user ? (
            <>
              <div className="hidden md:flex space-x-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <button onClick={() => setActiveTab('discover')} className={`hover:text-purple-600 transition-colors ${activeTab === 'discover' ? 'text-purple-600' : ''}`}>Marketplace</button>
                <button onClick={() => setActiveTab('matching')} className={`hover:text-purple-600 transition-colors ${activeTab === 'matching' ? 'text-purple-600' : ''}`}>AI Match</button>
              </div>
              <div className="h-6 w-[1px] bg-gray-100"></div>
              
              <div className="relative" ref={profileDropdownRef}>
                <div 
                  className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-gray-900 leading-none">{activeProfile?.fullName}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{activeProfile?.role}</p>
                  </div>
                  <img 
                    src={activeProfile?.avatarUrl} 
                    className={`w-10 h-10 rounded-xl border-2 shadow-md transition-all ${isProfileDropdownOpen ? 'border-purple-600 ring-4 ring-purple-100' : 'border-white'}`} 
                    alt="User" 
                  />
                </div>

                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-[32px] shadow-3xl border border-gray-100 p-4 z-[200] animate-in slide-in-from-top-4 duration-300 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 mb-2">
                       <p className="text-xs font-black text-gray-900">{activeProfile?.fullName}</p>
                       <p className="text-[10px] text-gray-400 font-bold">{user.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <button 
                        onClick={() => { setActiveTab('profile'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 text-gray-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Dashboard />
                        <span>My Identity</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('wallet'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 text-gray-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Wallet />
                        <span>Wallet</span>
                      </button>
                      <button 
                        onClick={() => { setIsEntityMenuOpen(true); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 text-gray-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Plus />
                        <span>Switch Brand</span>
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50">
                       <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-red-50 text-red-500 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Close />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} className="text-gray-900 font-black text-xs uppercase tracking-widest px-6 py-3">Login</button>
              <button onClick={() => setView('signup')} className="bg-purple-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-2xl shadow-xl shadow-purple-200">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {user && (
        <Sidebar 
          role={activeProfile?.role || 'brand'} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}

      <main className={`${user ? (isCollapsed ? 'pl-32' : 'pl-80') : ''} pt-20 relative z-10 min-h-screen px-10 pb-20 transition-all duration-300`}>
        {renderContent()}
      </main>

      {/* Entity Creation Modal */}
      {isCreateEntityOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[48px] shadow-3xl w-full max-w-2xl my-auto overflow-hidden flex flex-col animate-in zoom-in duration-500">
            <div className="p-10 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Create New Brand</h2>
                <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mt-1">Expansion Hub</p>
              </div>
              <button onClick={() => setIsCreateEntityOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all"><Icons.Close /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Studio" 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold"
                    value={newEntity.fullName}
                    onChange={e => setNewEntity({...newEntity, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Industry</label>
                  <select 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold appearance-none"
                    value={newEntity.industry}
                    onChange={e => setNewEntity({...newEntity, industry: e.target.value})}
                  >
                    <option>Technology</option>
                    <option>Beauty & Health</option>
                    <option>Travel</option>
                    <option>Fashion</option>
                    <option>Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Identity Type</label>
                  <div className="flex gap-4">
                    {(['brand', 'influencer'] as UserRole[]).map(r => (
                      <button 
                        key={r}
                        onClick={() => setNewEntity({...newEntity, role: r})}
                        className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${newEntity.role === r ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Official Website</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold"
                    value={newEntity.website}
                    onChange={e => setNewEntity({...newEntity, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Biography & Mission</label>
                <textarea 
                  placeholder="Describe this brand's mission, target audience, and vibe..." 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold min-h-[120px] resize-none shadow-inner"
                  value={newEntity.bio}
                  onChange={e => setNewEntity({...newEntity, bio: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Primary Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. New York, USA" 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold"
                  value={newEntity.location}
                  onChange={e => setNewEntity({...newEntity, location: e.target.value})}
                />
              </div>

              <button 
                onClick={handleCreateNewEntity}
                disabled={!newEntity.fullName || !newEntity.bio}
                className="w-full py-6 bg-purple-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-30 mt-4"
              >
                Confirm and Sync New Brand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Launch Modal */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-3xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in duration-500">
            <div className="p-10 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">New Campaign</h2>
                <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mt-1">Syncing to {activeProfile?.fullName}</p>
              </div>
              <button onClick={() => setIsLaunchModalOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all"><Icons.Close /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Campaign Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Winter Skincare Drive" 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-gray-900 shadow-inner" 
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Platform</label>
                  <select 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-gray-900 appearance-none shadow-inner"
                    onChange={(e) => setNewCampaign({...newCampaign, platform: e.target.value})}
                  >
                    <option>TikTok</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Budget</label>
                  <input 
                    type="text" 
                    placeholder="$1,000" 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-gray-900 shadow-inner" 
                    onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <button 
                  onClick={handleGetForecast} 
                  disabled={isForecasting || !newCampaign.name}
                  className="w-full py-5 bg-purple-50 text-purple-700 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-purple-100 transition-all flex items-center justify-center space-x-3 border border-purple-100"
                >
                  {isForecasting ? <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div> : <Icons.Robot />}
                  <span>{isForecasting ? 'Simulating Strategy...' : 'AI Performance Forecast'}</span>
                </button>
                {forecastResult && (
                  <div className="p-6 bg-gray-900 rounded-3xl text-sm italic font-medium text-gray-300 border border-white/5 leading-relaxed">
                    "{forecastResult}"
                  </div>
                )}
                <button 
                  onClick={handleLaunchCampaign} 
                  disabled={!newCampaign.name || !newCampaign.budget}
                  className="w-full py-6 bg-purple-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-30"
                >
                  Confirm and Sync to Cloud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;