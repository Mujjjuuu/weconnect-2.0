
import React, { useState, useEffect } from 'react';
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
import { Icons } from './constants';
import { getCampaignForecast } from './services/geminiService';
import { supabase, seedInitialData, isSupabaseConfigured } from './services/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', platform: 'TikTok', budget: '' });
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await seedInitialData();
    };
    init();
  }, []);

  useEffect(() => {
    if (view === 'app' && user) {
      fetchUserCampaigns();
    }
  }, [view, user]);

  const fetchUserCampaigns = async () => {
    if (!user || !isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .or(`brand_id.eq.${user.id},influencers_ids.cs.{${user.id}}`)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCampaigns(data.map(c => ({
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
      console.error("Campaign fetch failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginComplete = async (authenticatedUser: any, selectedRole: UserRole) => {
    setLoading(true);
    try {
      let profileData: Profile | null = null;

      if (isSupabaseConfigured()) {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', authenticatedUser.email)
          .maybeSingle();

        if (existingProfile && !fetchError) {
          profileData = {
            id: existingProfile.id,
            fullName: existingProfile.full_name || 'User',
            email: existingProfile.email,
            avatarUrl: existingProfile.avatar_url || `https://ui-avatars.com/api/?name=${existingProfile.full_name || 'User'}&background=7C3AED&color=fff`,
            bio: existingProfile.bio || '',
            role: (existingProfile.role as UserRole) || selectedRole,
            location: existingProfile.location || 'Remote',
            phone: existingProfile.phone,
            website: existingProfile.website,
            workVideos: existingProfile.work_videos,
            socialLinks: existingProfile.social_links
          };
        } else {
          const newProfile = {
            id: authenticatedUser.id,
            full_name: authenticatedUser.email.split('@')[0],
            email: authenticatedUser.email,
            avatar_url: `https://ui-avatars.com/api/?name=${authenticatedUser.email.split('@')[0]}&background=7C3AED&color=fff`,
            bio: `New ${selectedRole} on WeConnect.`,
            role: selectedRole,
            location: 'Remote'
          };
          
          const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
          
          if (!insertError) {
            profileData = { 
              ...newProfile, 
              fullName: newProfile.full_name, 
              avatarUrl: newProfile.avatar_url,
              role: selectedRole
            };
            
            if (selectedRole === 'influencer') {
              await supabase.from('influencers').insert([{ 
                profile_id: authenticatedUser.id,
                handle: `@${authenticatedUser.email.split('@')[0]}`,
                niche: ['General'],
                followers: '0',
                engagement_rate: '0%',
                ai_score: 50
              }]);
            }
          }
        }
      }

      setUser({
        id: profileData?.id || authenticatedUser.id,
        email: profileData?.email || authenticatedUser.email,
        fullName: profileData?.fullName || 'User',
        currentRole: profileData?.role || selectedRole,
        profileData: profileData || undefined
      });
      setView('app');
    } catch (err) {
      console.error("Login mapping error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!user) return;
    const campaignId = `camp_${Math.random().toString(36).substr(2, 9)}`;
    const campaignToAdd = {
      id: campaignId,
      name: newCampaign.name,
      status: 'active',
      budget: newCampaign.budget,
      progress: 0,
      deliverables: [newCampaign.platform],
      influencers_count: 0,
      brand_id: user.id
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('campaigns').insert([campaignToAdd]).select().single();
      if (!error && data) {
        setCampaigns(prev => [
          {
            id: String(data.id),
            name: data.name,
            status: data.status,
            budget: data.budget,
            progress: data.progress,
            deliverables: data.deliverables,
            influencersCount: data.influencers_count,
            brandId: data.brand_id
          }, 
          ...prev
        ]);
      } else if (error) {
        console.error("Campaign creation error:", error.message);
      }
    } else {
      setCampaigns(prev => [campaignToAdd as any, ...prev]);
    }
    
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
      console.error("Forecasting failed:", error);
      setForecastResult("Forecast engine is currently recalibrating.");
    } finally {
      setIsForecasting(false);
    }
  };

  const switchRole = async () => {
    if (!user) return;
    const newRole = user.currentRole === 'brand' ? 'influencer' : 'brand';
    
    if (isSupabaseConfigured()) {
      await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    }
    
    setUser({ ...user, currentRole: newRole });
    setActiveTab('dashboard');
  };

  if (view === 'landing') return <LandingPage onEnterLogin={() => setView('login')} onEnterExplore={() => { setView('app'); setActiveTab('discover'); }} />;
  if (view === 'login' || view === 'signup') return <Login onLoginComplete={handleLoginComplete} onCancel={() => setView('landing')} initialMode={view === 'signup' ? 'signup' : 'login'} />;

  const renderContent = () => {
    const role = user?.currentRole || 'brand';

    if (activeTab === 'public_profile' && selectedInfluencer) {
        return <PublicProfileView 
                  influencer={selectedInfluencer} 
                  onBack={() => setActiveTab('discover')} 
                  onSecureDeal={() => setActiveTab('messages')}
               />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12 max-w-6xl mx-auto py-12 animate-in fade-in duration-1000">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome, {user?.fullName}.</h1>
                <p className="text-gray-500 mt-1 font-medium text-lg italic">Persistent Identity: <span className="text-purple-600 font-black">{role.toUpperCase()}</span></p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                 <button onClick={switchRole} className="bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-purple-200 hover:text-purple-600 transition-all flex items-center space-x-3 shadow-sm active:scale-95">
                  <Icons.Settings />
                  <span>Switch Role</span>
                </button>
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
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Supabase Live Connection</span>
                </div>
                <h2 className="text-5xl font-black mb-6 tracking-tight">Your WeConnect Business Hub.</h2>
                <p className="text-purple-100 text-lg mb-10 font-medium opacity-90 leading-relaxed max-w-xl">
                  {role === 'brand' 
                    ? "Your campaigns and brand assets are safely stored in our encrypted neural database." 
                    : "Track your earnings, messages, and partnership contracts in one central profile."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setActiveTab('matching')} className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95">
                    AI Match Now
                  </button>
                  <button onClick={() => setActiveTab('discover')} className="bg-purple-600/30 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600/50 transition-all active:scale-95">
                    Marketplace
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'DB Status', value: 'Live', trend: 'Healthy', color: 'text-green-600' },
                { label: 'Live Campaigns', value: campaigns.length.toString(), trend: 'Active', color: 'text-blue-600' },
                { label: 'Stored Messages', value: 'SYNCED', trend: 'Encrypted', color: 'text-purple-600' },
                { label: 'Cloud Sync', value: '100%', trend: 'Reliable', color: 'text-orange-600' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">{stat.label}</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                  <p className={`text-xs mt-3 font-bold ${stat.color}`}>{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <div className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Database Logs</h3>
                     <button onClick={() => setActiveTab('campaigns')} className="text-purple-600 font-black text-[10px] uppercase tracking-widest hover:underline">Full Log</button>
                   </div>
                   <div className="space-y-4">
                      {campaigns.length > 0 ? campaigns.slice(0, 3).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-purple-100 group">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                              <Icons.Campaigns />
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{c.name}</p>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{c.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-gray-900">{c.budget}</p>
                             <div className="w-20 bg-gray-200 h-1 rounded-full overflow-hidden mt-1">
                                <div className="bg-purple-600 h-full" style={{width: `${c.progress}%`}}></div>
                             </div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center py-10 text-gray-400 font-bold text-xs uppercase tracking-widest">No Active Campaigns</p>
                      )}
                   </div>
                </div>
                <AIAnalyzer />
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
        return <DiscoverFeed onSelectInfluencer={(inf) => { setSelectedInfluencer(inf); setActiveTab('public_profile'); }} onSecureDeal={() => setActiveTab('messages')} />;
      case 'matching':
        return <MatchingSystem />;
      case 'profile':
        return user ? <ProfileView user={user} onUpdate={(updated) => setUser({ ...user, profileData: updated, fullName: updated.fullName })} /> : null;
      case 'wallet':
        return user ? <WalletView user={user} /> : null;
      case 'messages':
        return user ? <MessagesView user={user} /> : null;
      default:
        return <div className="text-center py-40 text-gray-400 font-bold uppercase tracking-widest">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="neural-mesh"></div>

      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-[100] h-20 flex items-center px-10">
        <div className="flex items-center space-x-4 mr-16 cursor-pointer group" onClick={() => { if (user) setActiveTab('dashboard'); else setView('landing'); }}>
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-105 transition-all">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
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
              <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('profile')}>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-gray-900 leading-none">{user.fullName}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user.currentRole}</p>
                </div>
                <img 
                  src={user.profileData?.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=7C3AED&color=fff`} 
                  className="w-10 h-10 rounded-xl border-2 border-white shadow-md" 
                  alt="User" 
                />
                <button onClick={(e) => { e.stopPropagation(); setView('landing'); setUser(null); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-2">
                  <Icons.Close />
                </button>
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

      {user && <Sidebar role={user.currentRole} activeTab={activeTab} setActiveTab={setActiveTab} />}

      <main className={`${user ? 'pl-72' : ''} pt-20 relative z-10 min-h-screen px-10 pb-20`}>
        {renderContent()}
      </main>

      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-3xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in duration-500">
            <div className="p-10 bg-gray-900 text-white flex justify-between items-center relative overflow-hidden">
              <div>
                <h2 className="text-3xl font-black tracking-tight">New Campaign</h2>
                <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mt-1">Database Sync Active</p>
              </div>
              <button onClick={() => setIsLaunchModalOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all"><Icons.Close /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Campaign Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Winter Skincare Drive" 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 shadow-inner" 
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Platform</label>
                  <select 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 appearance-none shadow-inner"
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
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 shadow-inner" 
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
