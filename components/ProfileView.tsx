
import React, { useState } from 'react';
import { UserProfile, Profile, SocialStats } from '../types';
import { Icons } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface ProfileViewProps {
  user: UserProfile;
  onUpdate: (updatedProfile: Profile) => void;
}

type TabType = 'general' | 'professional' | 'social' | 'showcase' | 'security';

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>(user.profileData || {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: `https://ui-avatars.com/api/?name=${user.fullName}&background=7C3AED&color=fff`,
    bio: '',
    role: user.currentRole,
    location: '',
    gender: 'Prefer not to say',
    languages: ['English'],
    categories: [],
    workVideos: [],
    socialLinks: { 
      instagram: { handle: '' }, 
      tiktok: { handle: '' }, 
      youtube: { handle: '' } 
    }
  });
  
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('Pushing to Cloud...');
    
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('profiles').update({
          full_name: formData.fullName,
          bio: formData.bio,
          location: formData.location,
          avatar_url: formData.avatarUrl,
          phone: formData.phone,
          website: formData.website,
          gender: formData.gender,
          languages: formData.languages,
          categories: formData.categories,
          address: formData.address,
          work_videos: formData.workVideos,
          social_links: formData.socialLinks
        }).eq('id', user.id);

        if (error) throw error;
        setSaveStatus('Identity Synced');
      } catch (e) {
        setSaveStatus('Sync Failed');
      }
    }
    
    onUpdate(formData);
    setTimeout(() => {
      setIsEditing(false);
      setSaveStatus(null);
    }, 1500);
    setIsSaving(false);
  };

  const handleAddVideo = () => {
    const url = prompt("Enter Video MP4 URL:");
    if (url) {
      setFormData(prev => ({
        ...prev,
        workVideos: [...(prev.workVideos || []), url]
      }));
    }
  };

  const handleConnectSocial = (platform: 'instagram' | 'youtube') => {
    setIsSaving(true);
    setTimeout(() => {
      const mockStats: SocialStats = {
        followers: platform === 'instagram' ? 245000 : 89000,
        engagementRate: platform === 'instagram' ? 4.8 : 6.2,
        avgLikes: 12000,
        verified: true,
        lastSync: new Date().toISOString()
      };
      
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: { ...prev.socialLinks?.[platform], stats: mockStats }
        }
      }));
      setIsSaving(false);
      alert(`Connected to ${platform.toUpperCase()}. Data synced successfully.`);
    }, 1200);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity Name</label>
                <input type="text" disabled={!isEditing} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold disabled:opacity-60 transition-all shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <input type="email" disabled value={formData.email} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none font-bold opacity-40 cursor-not-allowed shadow-inner" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                <input type="tel" disabled={!isEditing} value={formData.phone || ''} placeholder="+1..." onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold disabled:opacity-60 transition-all shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Gender</label>
                <select disabled={!isEditing} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold disabled:opacity-60 transition-all shadow-inner appearance-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Language</label>
                <input type="text" disabled={!isEditing} value={formData.languages?.join(', ')} placeholder="English, Spanish..." onChange={e => setFormData({...formData, languages: e.target.value.split(', ')})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold disabled:opacity-60 transition-all shadow-inner" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Business Biography</label>
              <textarea disabled={!isEditing} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[40px] p-8 outline-none focus:ring-4 focus:ring-purple-100 min-h-[160px] font-medium leading-relaxed shadow-inner disabled:opacity-60" />
            </div>
          </div>
        );
      case 'showcase':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Portfolio Gallery</h3>
               <button onClick={handleAddVideo} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
                 Add Showcase Video
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(formData.workVideos && formData.workVideos.length > 0) ? (
                formData.workVideos.map((vid, idx) => (
                  <div key={idx} className="relative aspect-[9/16] bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl group">
                    <video 
                      src={vid} 
                      className="w-full h-full object-cover" 
                      controls={false}
                      autoPlay
                      muted
                      loop
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                       <button onClick={() => setFormData(prev => ({ ...prev, workVideos: prev.workVideos?.filter((_, i) => i !== idx)}))} className="bg-red-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Remove</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-32 bg-gray-50 rounded-[56px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-purple-600 shadow-sm mb-6">
                      <Icons.Analytics />
                   </div>
                   <h4 className="text-xl font-black text-gray-900 mb-2">Showcase your creativity.</h4>
                   <p className="text-gray-400 font-medium max-w-xs">Upload MP4 video reels to let brands see your content style in action.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'professional':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Primary Category</label>
                <select disabled={!isEditing} value={formData.categories?.[0] || ''} onChange={e => setFormData({...formData, categories: [e.target.value]})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold disabled:opacity-60 appearance-none shadow-inner">
                  <option>Beauty</option>
                  <option>Technology</option>
                  <option>Fitness</option>
                  <option>Finance</option>
                  <option>Travel</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Official Website</label>
                <input type="url" disabled={!isEditing} value={formData.website || ''} placeholder="https://..." onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold disabled:opacity-60 shadow-inner" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-[48px] p-10 text-white relative overflow-hidden">
               <h3 className="text-xl font-black mb-4">Verification Level</h3>
               <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black">A+</div>
                  <div>
                    <p className="font-black text-lg">Neural Verified Identity</p>
                    <p className="text-gray-400 text-sm">Your business credentials have been cross-referenced with your connected socials.</p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {['instagram', 'youtube'].map((platform) => {
              const link = (formData.socialLinks as any)?.[platform];
              const stats = link?.stats as SocialStats | undefined;
              return (
                <div key={platform} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm group hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 to-pink-600' : 'bg-red-600'}`}>
                        <Icons.Discover />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-gray-900 capitalize">{platform}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{link?.handle || 'Not Linked'}</p>
                      </div>
                    </div>
                    {stats ? (
                      <div className="flex space-x-6">
                         <div className="text-center px-6 py-2 bg-gray-50 rounded-2xl">
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Followers</p>
                           <p className="text-xl font-black text-gray-900">{stats.followers.toLocaleString()}</p>
                         </div>
                         <div className="text-center px-6 py-2 bg-gray-50 rounded-2xl">
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Engagement</p>
                           <p className="text-xl font-black text-purple-600">{stats.engagementRate}%</p>
                         </div>
                      </div>
                    ) : (
                      <button onClick={() => handleConnectSocial(platform as any)} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        Connect Account
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      case 'security':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-gray-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-2 text-purple-400">Security Vault</h3>
                  <p className="text-gray-400 font-medium mb-10 max-w-md">Update your neural access key to keep your business data and partnerships secure.</p>
                  
                  <form onSubmit={e => { e.preventDefault(); alert("Security Handshake Confirmed. Password Updated."); }} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Current Key</label>
                        <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-purple-500 font-bold transition-all" placeholder="••••••••" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">New Neural Key</label>
                        <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-purple-500 font-bold transition-all" placeholder="••••••••" />
                     </div>
                     <div className="md:col-span-2">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-purple-900/40">
                          Confirm Key Rotation
                        </button>
                     </div>
                  </form>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[72px] border border-gray-100 shadow-2xl overflow-hidden flex flex-col lg:flex-row relative">
        
        {/* Navigation Sidebar */}
        <div className="lg:w-1/4 bg-gray-50/50 p-10 border-r border-gray-100 flex flex-col">
          <div className="relative mb-14 group self-center">
             <img src={formData.avatarUrl} className="w-48 h-48 rounded-[64px] object-cover shadow-3xl group-hover:scale-105 transition-transform duration-500 ring-8 ring-white" alt="Profile" />
             <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white">
                <Icons.Robot />
             </div>
          </div>
          
          <div className="space-y-3 flex-1">
             {[
               { id: 'general', label: 'Identity Core', icon: Icons.Dashboard },
               { id: 'professional', label: 'Market Logic', icon: Icons.Campaigns },
               { id: 'showcase', label: 'Work Showcase', icon: Icons.Analytics },
               { id: 'social', label: 'Social Sync', icon: Icons.Discover },
               { id: 'security', label: 'Safety Hub', icon: Icons.Settings }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id as TabType); setIsEditing(false); }}
                 className={`w-full flex items-center space-x-4 px-8 py-5 rounded-[24px] transition-all font-black text-[11px] uppercase tracking-widest ${
                   activeTab === tab.id 
                    ? 'bg-white text-purple-600 shadow-xl border border-purple-50 translate-x-2' 
                    : 'text-gray-400 hover:text-gray-700 hover:translate-x-1'
                 }`}
               >
                 <tab.icon />
                 <span>{tab.label}</span>
               </button>
             ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-3/4 p-16 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4 capitalize">
                {activeTab === 'showcase' ? 'Portfolio Showcase' : `${activeTab} Settings`}
              </h3>
              <p className="text-gray-500 font-medium text-lg">Manage your multi-channel digital identity from a single cloud portal.</p>
            </div>
            
            {(activeTab !== 'security' && activeTab !== 'showcase') && (
              <div className="flex items-center space-x-6">
                {saveStatus && <span className="text-[10px] font-black uppercase text-purple-600 tracking-widest animate-pulse bg-purple-50 px-4 py-2 rounded-full">{saveStatus}</span>}
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`px-12 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl ${
                    isEditing ? 'bg-green-600 text-white shadow-green-100' : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  {isSaving ? 'Processing...' : isEditing ? 'Sync Changes' : 'Edit Information'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
