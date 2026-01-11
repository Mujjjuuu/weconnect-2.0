
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DiscoverFeed from './components/DiscoverFeed';
import AIAnalyzer from './components/AIAnalyzer';
import AIChatbot, { AIChatbotRef } from './components/AIChatbot';
import MatchingSystem from './components/MatchingSystem';
import CampaignManager from './components/CampaignManager';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import ProfileView from './components/ProfileView';
import PublicProfileView from './components/PublicProfileView';
import WalletView from './components/WalletView';
import MessagesView from './components/MessagesView';
import { UserRole, Campaign, UserProfile, Profile, Influencer, NeuralAgent, ChatPartner } from './types';
import { Icons, BrandLogo, NEURAL_AGENTS } from './constants';
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
  const [activeChatPartner, setActiveChatPartner] = useState<ChatPartner | null>(null);
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
  const chatbotRef = useRef<AIChatbotRef>(null);

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
      console.warn("App Cloud Exception: Falling back to local state management.");
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

    if (isCloudVerified && supabase) {
      try {
        await supabase.from('campaigns').insert([{
          name: campaignToAdd.name,
          budget: campaignToAdd.budget,
          deliverables: campaignToAdd.deliverables,
          status: campaignToAdd.status,
          progress: campaignToAdd.progress,
          influencers_count: campaignToAdd.influencersCount,
          brand_id: campaignToAdd.brandId
        }]);
      } catch (e) {
        console.error("Cloud campaign sync failed:", e);
      }
    }

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
      setForecastResult("Neural forecasting is temporarily unavailable.");
    } finally {
      setIsForecasting(false);
    }
  };

  const handleSecureDeal = (inf: Influencer) => {
    if (!user) {
      setView('login');
      return;
    }
    setActiveChatPartner(inf);
    setActiveTab('messages');
    chatbotRef.current?.openWithPartner(inf);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setIsProfileDropdownOpen(false);
  };

  const handleSelectAgent = (agent: NeuralAgent) => {
    setActiveChatPartner(agent);
    setActiveTab('messages');
    chatbotRef.current?.openWithPartner(agent);
  };

  if (view === 'landing') return <LandingPage onEnterLogin={() => setView('login')} onEnterExplore={() => { setView('app'); setActiveTab('discover'); }} />;
  if (view === 'login' || view === 'signup') return <Login onLoginComplete={handleLoginComplete} onCancel={() => setView('landing')} initialMode={view === 'signup' ? 'signup' : 'login'} />;

  const renderContent = () => {
    if (!user || !activeProfile) return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
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
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-8 py-4 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-3xl animate-in slide-in-from-top-12 duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span>Neural Cloud Handshake Complete</span>
                  </div>
                </div>
             )}

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Welcome, {activeProfile.fullName}.</h1>
                <div className="relative">
                  <button 
                    onClick={() => setIsEntityMenuOpen(!isEntityMenuOpen)}
                    className="flex items-center space-x-3 text-gray-500 mt-2 font-black text-xs uppercase tracking-widest hover:text-purple-600 transition-colors"
                  >
                    <span>Managing {role === 'brand' ? 'Brand' : 'Influencer'}: {activeProfile.fullName}</span>
                    <Icons.ChevronDown />
                  </button>
                  
                  {isEntityMenuOpen && (
                    <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-[32px] shadow-3xl border border-gray-100 p-6 z-[200] animate-in slide-in-from-top-4 duration-300">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-4">Switch Identity</p>
                      <div className="space-y-2">
                        {user.entities.map(e => (
                          <button 
                            key={e.id}
                            onClick={() => switchActiveEntity(e.id)}
                            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${user.activeEntityId === e.id ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'hover:bg-gray-50 text-gray-600 border border-transparent'}`}
                          >
                            <img src={e.avatarUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                            <div className="text-left">
                              <p className="font-black text-sm leading-tight">{e.fullName}</p>
                              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">{e.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <button 
                          onClick={() => setIsCreateEntityOpen(true)}
                          className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
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
                  <button onClick={() => setIsLaunchModalOpen(true)} className="bg-purple-600 text-white px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center space-x-3 shadow-3xl shadow-purple-100 active:scale-95">
                    <Icons.Campaigns />
                    <span>New Campaign</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-[64px] p-20 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-3 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 mb-10">
                  <div className={`w-2 h-2 ${isCloudVerified ? 'bg-green-400' : 'bg-amber-400'} rounded-full animate-pulse`}></div>
                  <span>WeConnect Live Hub {isCloudVerified ? '(Cloud Protocol Active)' : '(Local Simulation Mode)'}</span>
                </div>
                <h2 className="text-7xl font-black mb-8 tracking-tighter leading-none">Your Marketplace Command.</h2>
                <p className="text-purple-100 text-xl mb-12 font-medium opacity-90 leading-relaxed max-w-2xl">
                  Manage multiple brand identities and creator portfolios from a single neural interface. Switch instantly using the identity selector.
                </p>
                <div className="flex flex-wrap gap-6">
                  <button onClick={() => setActiveTab('matching')} className="bg-white text-purple-700 px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl active:scale-95">
                    Execute AI Match
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Network Role', value: role.toUpperCase(), trend: 'Identity Verified', color: 'text-purple-600' },
                { label: 'Active Fleet', value: campaigns.length.toString(), trend: 'Live Tasks', color: 'text-blue-600' },
                { label: 'Access Level', value: 'ENTERPRISE', trend: 'Neural Pro', color: 'text-green-600' },
                { label: 'Sync Status', value: isCloudVerified ? 'VERIFIED' : 'LOCAL', trend: isCloudVerified ? 'Cloud Pulse' : 'Demo State', color: isCloudVerified ? 'text-green-600' : 'text-amber-600' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-3xl transition-all relative overflow-hidden group">
                  {stat.label === 'Sync Status' && isCloudVerified && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  )}
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">{stat.label}</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                  <p className={`text-[10px] mt-4 font-black uppercase tracking-widest ${stat.color}`}>{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                <CampaignManager sharedCampaigns={campaigns} onUpdateCampaigns={(newList) => setCampaigns(newList)} />
              </div>
              <div className="space-y-12">
                <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm">
                   <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">Neural Agents</h3>
                   <div className="space-y-5">
                      {NEURAL_AGENTS.map(agent => (
                        <button 
                          key={agent.id}
                          onClick={() => handleSelectAgent(agent)}
                          className="w-full flex items-center justify-between p-6 rounded-[28px] hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                        >
                           <div className="flex items-center space-x-5">
                              <img src={agent.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform duration-500" alt="" />
                              <div className="text-left">
                                <p className="font-black text-gray-900 leading-tight">{agent.name}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{agent.role}</p>
                              </div>
                           </div>
                           <div className={`w-3 h-3 ${agent.color} rounded-full opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'campaigns':
        return <CampaignManager sharedCampaigns={campaigns} onUpdateCampaigns={(newList) => setCampaigns(newList)} />;
      case 'discover':
        return <DiscoverFeed onSelectInfluencer={(inf) => { setSelectedInfluencer(inf); setActiveTab('public_profile'); }} onSecureDeal={handleSecureDeal} />;
      case 'matching':
        return <MatchingSystem onSecureDeal={handleSecureDeal} onViewProfile={(inf) => { setSelectedInfluencer(inf); setActiveTab('public_profile'); }} />;
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
        return <MessagesView user={user} initialPartner={activeChatPartner} />;
      default:
        return <div className="text-center py-40 text-gray-400 font-bold uppercase tracking-widest">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] selection:bg-purple-100 selection:text-purple-900">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-b border-gray-100 z-[100] h-24 flex items-center px-12">
        <div className="flex items-center space-x-5 mr-20 cursor-pointer group" onClick={() => { if (user) setActiveTab('dashboard'); else setView('landing'); }}>
          <div className="group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <BrandLogo size="md" />
          </div>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">WeConnect</span>
        </div>
        
        <div className="flex items-center ml-auto space-x-12">
          {user ? (
            <>
              <div className="hidden lg:flex space-x-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                <button onClick={() => setActiveTab('discover')} className={`hover:text-purple-600 transition-colors ${activeTab === 'discover' ? 'text-purple-600' : ''}`}>Marketplace</button>
                <button onClick={() => setActiveTab('matching')} className={`hover:text-purple-600 transition-colors ${activeTab === 'matching' ? 'text-purple-600' : ''}`}>AI Match</button>
              </div>
              <div className="h-8 w-[2px] bg-gray-100"></div>
              
              <div className="relative" ref={profileDropdownRef}>
                <div 
                  className="flex items-center space-x-5 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-gray-900 leading-none">{activeProfile?.fullName}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{activeProfile?.role}</p>
                  </div>
                  <img 
                    src={activeProfile?.avatarUrl} 
                    className={`w-12 h-12 rounded-2xl border-[3px] shadow-xl transition-all object-cover ${isProfileDropdownOpen ? 'border-purple-600 ring-4 ring-purple-100 scale-105' : 'border-white'}`} 
                    alt="User Identity" 
                  />
                </div>

                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-6 w-80 bg-white rounded-[40px] shadow-3xl border border-gray-100 p-6 z-[200] animate-in slide-in-from-top-4 duration-300 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 mb-4 bg-gray-50/50 rounded-[28px]">
                       <p className="text-sm font-black text-gray-900 leading-none">{activeProfile?.fullName}</p>
                       <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest truncate">{user.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <button 
                        onClick={() => { setActiveTab('profile'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center space-x-4 p-4 hover:bg-purple-50 text-gray-600 hover:text-purple-600 rounded-[20px] transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Dashboard />
                        <span>Identity Hub</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('wallet'); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center space-x-4 p-4 hover:bg-purple-50 text-gray-600 hover:text-purple-600 rounded-[20px] transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Wallet />
                        <span>Financials</span>
                      </button>
                      <button 
                        onClick={() => { setIsEntityMenuOpen(true); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center space-x-4 p-4 hover:bg-purple-50 text-gray-600 hover:text-purple-600 rounded-[20px] transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Plus />
                        <span>Switch Profile</span>
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                       <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 p-4 hover:bg-red-50 text-red-500 rounded-[20px] transition-all font-black text-[10px] uppercase tracking-widest text-left"
                      >
                        <Icons.Close />
                        <span>Sever Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} className="text-gray-900 font-black text-[10px] uppercase tracking-widest px-8 py-4 active:scale-95">Login</button>
              <button onClick={() => setView('signup')} className="bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest px-10 py-4 rounded-[20px] shadow-3xl shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all">Launch Account</button>
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
          onSelectAgent={handleSelectAgent}
        />
      )}

      <main className={`${user ? (isCollapsed ? 'pl-32' : 'pl-80') : ''} pt-24 relative z-10 min-h-screen px-12 pb-24 transition-all duration-500`}>
        {renderContent()}
      </main>

      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default App;
