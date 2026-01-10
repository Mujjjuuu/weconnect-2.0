
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Profile, SocialStats } from '../types';
import { Icons, BrandLogo } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface ProfileViewProps {
  user: UserProfile;
  activeEntityId: string;
  onUpdate: (updatedProfile: Profile) => void;
}

type TabType = 'general' | 'professional' | 'social' | 'showcase' | 'assets' | 'security';

const ProfileView: React.FC<ProfileViewProps> = ({ user, activeEntityId, onUpdate }) => {
  const activeProfile = user.entities.find(e => e.id === activeEntityId);
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>(activeProfile || {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: `https://ui-avatars.com/api/?name=${user.fullName}&background=7C3AED&color=fff`,
    bio: '',
    role: 'brand',
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeProfile) {
      setFormData(activeProfile);
    }
  }, [activeProfile]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const tabs: {id: TabType, label: string, icon: any}[] = [
    { id: 'general', label: 'Identity Core', icon: Icons.Dashboard },
    { id: 'professional', label: 'Market Logic', icon: Icons.Campaigns },
    { id: 'showcase', label: 'Work Showcase', icon: Icons.Analytics },
    { id: 'assets', label: 'Brand Assets', icon: Icons.Plus },
    { id: 'social', label: 'Social Sync', icon: Icons.Discover },
    { id: 'security', label: 'Safety Hub', icon: Icons.Settings }
  ];

  const activeTabIndex = tabs.findIndex(t => t.id === activeTab) + 1;

  const handleDownloadLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Drawing a high-quality reproduction of the SVG logo onto canvas
    canvas.width = 1024;
    canvas.height = 1024;
    ctx.clearRect(0, 0, 1024, 1024);
    
    // Background Glow
    const gradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 512);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Redraw Logo Paths (Simplified for export)
    ctx.lineCap = 'round';
    ctx.lineWidth = 120;
    
    // Blue Path
    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.moveTo(250, 450);
    ctx.quadraticCurveTo(200, 650, 300, 800);
    ctx.quadraticCurveTo(400, 800, 500, 450);
    ctx.stroke();

    // Purple Path
    ctx.beginPath();
    ctx.strokeStyle = '#A855F7';
    ctx.moveTo(750, 450);
    ctx.quadraticCurveTo(800, 650, 700, 800);
    ctx.quadraticCurveTo(600, 800, 500, 450);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#7DD3FC';
    ctx.beginPath();
    ctx.arc(250, 250, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C084FC';
    ctx.beginPath();
    ctx.arc(750, 250, 80, 0, Math.PI * 2);
    ctx.fill();

    const link = document.createElement('a');
    link.download = 'weconnect-logo-hq.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

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
        }).eq('id', formData.id);

        if (error) throw error;
        setSaveStatus('Identity Synced');
      } catch (e: any) {
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity Name</label>
                <input type="text" disabled={!isEditing} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <input type="email" disabled value={formData.email} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none font-bold text-gray-900 opacity-40 cursor-not-allowed shadow-inner" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Business Biography</label>
              <textarea disabled={!isEditing} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[40px] p-8 outline-none focus:ring-4 focus:ring-purple-100 min-h-[160px] font-medium leading-relaxed shadow-inner text-gray-900 disabled:opacity-60" />
            </div>
          </div>
        );
      case 'assets':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="bg-gray-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                   <h3 className="text-3xl font-black mb-6 tracking-tight">Platform Assets</h3>
                   <p className="text-gray-400 font-medium mb-12 max-w-md">Download high-resolution official WeConnect brand assets for use in your external marketing and content.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 flex flex-col items-center text-center group hover:border-purple-500/50 transition-all">
                         <div className="mb-8">
                            <BrandLogo size="xl" />
                         </div>
                         <h4 className="text-xl font-black mb-2">Primary Logo</h4>
                         <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">PNG High-Resolution (1024x1024)</p>
                         <button 
                          onClick={handleDownloadLogo}
                          className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all active:scale-95"
                         >
                           Download Logo PNG
                         </button>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8">
                            <Icons.Campaigns />
                         </div>
                         <h4 className="text-xl font-black mb-2">Media Kit</h4>
                         <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">PDF Documentation</p>
                         <button disabled className="w-full border border-white/10 text-white/30 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                           Coming Soon
                         </button>
                      </div>
                   </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
             </div>
          </div>
        );
      case 'showcase':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-center">
               <div>
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Portfolio Gallery</h3>
                 <p className="text-gray-500 text-sm font-medium mt-1">Manage your high-definition content samples.</p>
               </div>
               <button className="bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3">
                 <Icons.Plus />
                 <span>Add Video Link</span>
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
               <div className="col-span-3 py-32 bg-gray-50 rounded-[56px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-purple-600 shadow-sm mb-6">
                     <Icons.Analytics />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Showcase your creativity.</h4>
                  <p className="text-gray-400 font-medium max-w-xs">Upload MP4 video reels to let brands see your content style in action.</p>
               </div>
            </div>
          </div>
        );
      case 'professional':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Primary Category</label>
                <select disabled={!isEditing} value={formData.categories?.[0] || ''} onChange={e => setFormData({...formData, categories: [e.target.value]})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 disabled:opacity-60 appearance-none shadow-inner">
                  <option>Beauty</option>
                  <option>Technology</option>
                  <option>Fitness</option>
                  <option>Finance</option>
                  <option>Travel</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Official Website</label>
                <input type="url" disabled={!isEditing} value={formData.website || ''} placeholder="https://..." onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 disabled:opacity-60 shadow-inner" />
              </div>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {['instagram', 'youtube'].map((platform) => (
              <div key={platform} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 to-pink-600' : 'bg-red-600'}`}>
                      <Icons.Discover />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 capitalize">{platform}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Not Linked</p>
                    </div>
                  </div>
                  <button className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    Connect Account
                  </button>
                </div>
              </div>
            ))}
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
        <div className="lg:w-1/4 bg-gray-50/50 p-10 border-r border-gray-100 flex flex-col">
          <div className="relative mb-8 group self-center">
             <img src={formData.avatarUrl} className="w-48 h-48 rounded-[64px] object-cover shadow-3xl group-hover:scale-105 transition-transform duration-500 ring-8 ring-white" alt="Profile" />
          </div>
          <div className="space-y-2 flex-1">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                 className={`w-full flex items-center space-x-4 px-8 py-4.5 rounded-[24px] transition-all font-black text-[10px] uppercase tracking-widest ${
                   activeTab === tab.id 
                    ? 'bg-white text-purple-600 shadow-xl border border-purple-50 translate-x-1' 
                    : 'text-gray-400 hover:text-gray-700 hover:translate-x-1'
                 }`}
               >
                 <tab.icon />
                 <span>{tab.label}</span>
               </button>
             ))}
          </div>
        </div>

        <div className="lg:w-3/4 p-16 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4 capitalize">
                {activeTab === 'assets' ? 'Brand Assets' : `${activeTab} Hub`}
              </h3>
              <p className="text-gray-500 font-medium text-lg">Manage your digital identity and high-resolution platform assets.</p>
            </div>
            {(activeTab !== 'security' && activeTab !== 'assets' && activeTab !== 'showcase') && (
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-10 py-4.5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                  isEditing ? 'bg-green-600 text-white shadow-green-100' : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {isSaving ? 'Syncing...' : isEditing ? 'Push Changes' : 'Edit Information'}
              </button>
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
