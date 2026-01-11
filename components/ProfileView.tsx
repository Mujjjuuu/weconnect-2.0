
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Profile, SocialStats } from '../types';
import { Icons, BrandLogo } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { fetchYouTubeChannelData, formatCount } from '../services/youtubeService';

interface ProfileViewProps {
  user: UserProfile;
  activeEntityId: string;
  onUpdate: (updatedProfile: Profile) => void;
}

type TabType = 'identity' | 'professional' | 'social' | 'showcase' | 'brandkit' | 'security';

const ProfileView: React.FC<ProfileViewProps> = ({ user, activeEntityId, onUpdate }) => {
  const activeProfile = user.entities.find(e => e.id === activeEntityId);
  
  const [activeTab, setActiveTab] = useState<TabType>('identity');
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
  const [ytInput, setYtInput] = useState('');
  const [isConnectingYt, setIsConnectingYt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  useEffect(() => {
    if (activeProfile) {
      setFormData(activeProfile);
    }
  }, [activeProfile]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const tabs: {id: TabType, label: string, icon: any, desc: string}[] = [
    { id: 'identity', label: 'Identity Core', icon: Icons.Dashboard, desc: 'Primary profile details and persona' },
    { id: 'professional', label: 'Market Logic', icon: Icons.Campaigns, desc: 'Professional niches and brand focus' },
    { id: 'social', label: 'Social Sync', icon: Icons.Discover, desc: 'Live data from YouTube & Instagram' },
    { id: 'showcase', label: 'Portfolio', icon: Icons.Analytics, desc: 'Your best work and content reels' },
    { id: 'brandkit', label: 'Brand Assets', icon: Icons.Plus, desc: 'Official platform logos and media kit' },
    { id: 'security', label: 'Security', icon: Icons.Settings, desc: 'Safety keys and account protection' }
  ];

  const handleConnectYouTube = async () => {
    if (!ytInput.trim()) {
      setYtError("Please enter a YouTube URL or Handle");
      return;
    }

    setIsConnectingYt(true);
    setYtError(null);

    const data = await fetchYouTubeChannelData(ytInput);
    
    if (data) {
      const updatedSocial = {
        ...formData.socialLinks,
        youtube: {
          handle: data.channelName,
          stats: {
            followers: parseInt(data.subscriberCount),
            engagementRate: data.engagementRate,
            avgLikes: Math.round(parseInt(data.viewCount) / (parseInt(data.videoCount) || 1)),
            verified: true,
            lastSync: new Date().toISOString()
          }
        }
      };
      
      const newFormData = {
        ...formData,
        socialLinks: updatedSocial,
        avatarUrl: data.thumbnail || formData.avatarUrl
      };
      
      setFormData(newFormData);
      onUpdate(newFormData);
      setSaveStatus("Channel Synchronized");
      setYtInput('');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setYtError("Resource not found. Check the URL/Handle and try again.");
    }
    
    setIsConnectingYt(false);
  };

  const addVideo = () => {
    if (!newVideoUrl.trim()) return;
    const updatedVideos = [...(formData.workVideos || []), newVideoUrl.trim()];
    setFormData({ ...formData, workVideos: updatedVideos });
    setNewVideoUrl('');
  };

  const removeVideo = (index: number) => {
    const updatedVideos = [...(formData.workVideos || [])];
    updatedVideos.splice(index, 1);
    setFormData({ ...formData, workVideos: updatedVideos });
  };

  const handleDownloadLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1024;
    canvas.height = 1024;
    ctx.clearRect(0, 0, 1024, 1024);
    
    const gradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 512);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.lineCap = 'round';
    ctx.lineWidth = 120;
    
    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.moveTo(250, 450);
    ctx.quadraticCurveTo(200, 650, 300, 800);
    ctx.quadraticCurveTo(400, 800, 500, 450);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#A855F7';
    ctx.moveTo(750, 450);
    ctx.quadraticCurveTo(800, 650, 700, 800);
    ctx.quadraticCurveTo(600, 800, 500, 450);
    ctx.stroke();

    ctx.fillStyle = '#7DD3FC';
    ctx.beginPath();
    ctx.arc(250, 250, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C084FC';
    ctx.beginPath();
    ctx.arc(750, 250, 80, 0, Math.PI * 2);
    ctx.fill();

    const link = document.createElement('a');
    link.download = 'weconnect-identity-asset.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('Pulsing to Cloud...');
    
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
        setSaveStatus('Identity Confirmed');
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
      case 'identity':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing} 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-black shadow-inner transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Official Email</label>
                <input 
                  type="email" 
                  disabled 
                  value={formData.email} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none font-bold text-black opacity-40 cursor-not-allowed shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Base Location</label>
                <input 
                  type="text" 
                  disabled={!isEditing} 
                  placeholder="e.g. Los Angeles, CA"
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-black shadow-inner transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Languages</label>
                <input 
                  type="text" 
                  disabled={!isEditing} 
                  placeholder="e.g. English, Spanish"
                  value={formData.languages?.join(', ')} 
                  onChange={e => setFormData({...formData, languages: e.target.value.split(',').map(s => s.trim())})} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-black shadow-inner transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Identity Biography</label>
              <textarea 
                disabled={!isEditing} 
                value={formData.bio} 
                placeholder="Share your story, values, and what makes your brand unique..."
                onChange={e => setFormData({...formData, bio: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-100 rounded-[32px] p-8 outline-none focus:ring-4 focus:ring-purple-100 min-h-[200px] font-medium leading-relaxed shadow-inner text-black disabled:opacity-60 transition-all" 
              />
            </div>
          </div>
        );
      case 'professional':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-purple-50/50 p-8 rounded-[32px] border border-purple-100/50 flex items-start space-x-6">
               <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                  <Icons.Campaigns />
               </div>
               <div>
                  <h4 className="text-purple-900 font-black text-sm uppercase tracking-widest mb-1">Market Logic</h4>
                  <p className="text-purple-700 text-xs font-medium">Define your professional positioning. This data is used by our neural engine to find high-velocity brand matches.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Primary Content Niche</label>
                <div className="relative">
                  <select 
                    disabled={!isEditing} 
                    value={formData.categories?.[0] || ''} 
                    onChange={e => setFormData({...formData, categories: [e.target.value]})} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-black appearance-none shadow-inner disabled:opacity-60"
                  >
                    <option>Beauty & Lifestyle</option>
                    <option>Tech & Gaming</option>
                    <option>Fitness & Health</option>
                    <option>Finance & Crypto</option>
                    <option>Travel & Outdoors</option>
                    <option>Art & DIY</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    <Icons.ChevronDown />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Digital HQ (Website)</label>
                <input 
                  type="url" 
                  disabled={!isEditing} 
                  value={formData.website || ''} 
                  placeholder="https://yourbrand.com" 
                  onChange={e => setFormData({...formData, website: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-black shadow-inner transition-all" 
                />
              </div>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white bg-red-600 shadow-2xl shadow-red-200">
                    <Icons.Campaigns />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">YouTube Logic Sync</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${formData.socialLinks?.youtube?.verified ? 'text-green-500' : 'text-gray-400'}`}>
                      {formData.socialLinks?.youtube?.verified ? 'Neural Handshake Verified' : 'Awaiting Connection'}
                    </p>
                  </div>
                </div>

                {!formData.socialLinks?.youtube?.verified ? (
                  <div className="flex-1 flex gap-4 max-w-lg">
                    <div className="flex-1 relative">
                       <input 
                        type="text" 
                        placeholder="Paste Channel URL or @Handle" 
                        value={ytInput}
                        onChange={e => setYtInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleConnectYouTube()}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[24px] pl-6 pr-12 py-5 outline-none focus:ring-4 focus:ring-red-100 font-bold text-sm shadow-inner text-black transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                         <Icons.Discover />
                      </div>
                    </div>
                    <button 
                      onClick={handleConnectYouTube}
                      disabled={isConnectingYt}
                      className="bg-red-600 text-white px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {isConnectingYt ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-12 bg-gray-50 p-8 rounded-[32px] border border-gray-100 shadow-inner">
                    <div className="flex items-center space-x-4">
                       <img src={formData.avatarUrl} className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg object-cover" alt="" />
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Alias</p>
                          <p className="font-black text-black text-lg">{formData.socialLinks.youtube.handle}</p>
                       </div>
                    </div>
                    <div className="h-10 w-[1px] bg-gray-200 hidden sm:block"></div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audience</p>
                       <p className="font-black text-red-600 text-2xl tracking-tighter">{formatCount(formData.socialLinks.youtube.stats?.followers || 0)}</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Reach</p>
                       <p className="font-black text-black text-2xl tracking-tighter">{formatCount(formData.socialLinks.youtube.stats?.avgLikes || 0)}</p>
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, socialLinks: {...formData.socialLinks, youtube: undefined}})}
                      className="p-4 bg-white border border-gray-200 text-gray-300 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all shadow-sm group"
                      title="Sever Neural Link"
                    >
                      <Icons.Close />
                    </button>
                  </div>
                )}
              </div>
              {ytError && <p className="mt-6 text-xs font-bold text-red-500 flex items-center space-x-2 bg-red-50 p-4 rounded-xl border border-red-100 animate-in shake duration-500"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span><span>{ytError}</span></p>}
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm opacity-60 relative overflow-hidden grayscale pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-2xl shadow-pink-200">
                    <Icons.Discover />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">Instagram Meta Protocol</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">API Integration in Development</p>
                  </div>
                </div>
                <div className="bg-gray-100 text-gray-400 px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        );
      case 'showcase':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
               <div>
                 <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Content Showcase.</h3>
                 <p className="text-gray-500 text-lg font-medium">Your high-definition performance reels.</p>
               </div>
               <div className="flex w-full md:w-auto gap-4">
                  <input 
                    type="url" 
                    placeholder="Enter Video MP4 URL..." 
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                    className="flex-1 md:w-72 bg-gray-50 border border-gray-100 rounded-[20px] px-6 py-4 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-black text-sm shadow-inner"
                  />
                  <button 
                    onClick={addVideo}
                    className="bg-purple-600 text-white p-4 rounded-[20px] shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center"
                  >
                    <Icons.Plus />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {formData.workVideos && formData.workVideos.length > 0 ? (
                 formData.workVideos.map((url, idx) => (
                   <div key={idx} className="relative group aspect-[9/16] rounded-[40px] overflow-hidden bg-gray-900 shadow-2xl border-4 border-white">
                      <video src={url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                          onClick={() => removeVideo(idx)}
                          className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
                         >
                           Remove Asset
                         </button>
                      </div>
                      <div className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-[8px] font-black uppercase tracking-widest border border-white/20">
                         Reel #{idx + 1}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full py-40 bg-gray-50 rounded-[64px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-purple-600 shadow-sm mb-8">
                       <Icons.Analytics />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your stage is empty.</h4>
                    <p className="text-gray-400 font-medium max-w-sm px-6">Upload cinematic MP4 reels to let our AI and brand managers see your visual signature in action.</p>
                 </div>
               )}
            </div>
          </div>
        );
      case 'brandkit':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="bg-gray-900 rounded-[56px] p-16 text-white relative overflow-hidden shadow-3xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <div className="relative z-10">
                   <h3 className="text-4xl font-black mb-6 tracking-tighter">Verified Brand Kit</h3>
                   <p className="text-gray-400 font-medium text-lg mb-16 max-w-xl">Assets for your external communications. Use these high-definition markers to signal your verified status on WeConnect.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 flex flex-col items-center text-center group hover:border-purple-500/50 transition-all hover:-translate-y-2 duration-500">
                         <div className="mb-12 transform group-hover:scale-110 transition-transform duration-500">
                            <BrandLogo size="xl" />
                         </div>
                         <h4 className="text-2xl font-black mb-2 tracking-tight">Platform Signature</h4>
                         <p className="text-[10px] text-gray-500 mb-10 uppercase tracking-[0.2em] font-black">PNG High-Res (1024px)</p>
                         <button 
                          onClick={handleDownloadLogo}
                          className="w-full bg-white text-gray-900 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-2xl"
                         >
                           Download Sig
                         </button>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-10 border border-white/10">
                            <Icons.Campaigns />
                         </div>
                         <h4 className="text-2xl font-black mb-2 tracking-tight">Neural Media Kit</h4>
                         <p className="text-[10px] text-gray-500 mb-10 uppercase tracking-[0.2em] font-black">PDF Interactive (Coming Soon)</p>
                         <button disabled className="w-full border border-white/10 text-white/30 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] cursor-not-allowed">
                           Locked
                         </button>
                      </div>
                   </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
             </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-gray-900 rounded-[56px] p-16 text-white relative overflow-hidden shadow-3xl">
               <div className="relative z-10">
                  <div className="flex items-center space-x-6 mb-8">
                     <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-3xl flex items-center justify-center border border-purple-400/20">
                        <Icons.Settings />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black tracking-tight text-white">Neural Key Rotation</h3>
                        <p className="text-gray-400 font-medium">Protect your market identity and contracts.</p>
                     </div>
                  </div>
                  
                  <form onSubmit={e => { e.preventDefault(); alert("Neural Key Handshake Complete. Profile Secured."); }} className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Current Active Key</label>
                        <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 outline-none focus:ring-2 focus:ring-purple-500 font-bold transition-all text-white shadow-inner" placeholder="••••••••" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">New Neural Sequence</label>
                        <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 outline-none focus:ring-2 focus:ring-purple-500 font-bold transition-all text-white shadow-inner" placeholder="••••••••" />
                     </div>
                     <div className="md:col-span-2 pt-6">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-3xl shadow-purple-900/40">
                          Finalize Key Rotation
                        </button>
                     </div>
                  </form>
               </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="bg-white rounded-[72px] border border-gray-100 shadow-3xl overflow-hidden flex flex-col lg:flex-row relative min-h-[850px]">
        {/* Navigation Sidebar */}
        <div className="lg:w-[320px] bg-gray-50/50 p-10 border-r border-gray-100 flex flex-col">
          <div className="relative mb-12 group self-center text-center">
             <div className="relative">
                <img 
                  src={formData.avatarUrl} 
                  className="w-48 h-48 rounded-[56px] object-cover shadow-3xl group-hover:scale-105 transition-transform duration-700 ring-[12px] ring-white" 
                  alt="Profile" 
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-[56px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-purple-500 border-dashed m-[-6px]">
                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Update Photo</span>
                  </div>
                )}
             </div>
             <div className="mt-8">
                <p className="font-black text-gray-900 text-2xl tracking-tighter leading-none">{formData.fullName}</p>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mt-3 bg-purple-50 inline-block px-4 py-1.5 rounded-full border border-purple-100">{formData.role} IDENTITY</p>
             </div>
          </div>

          <div className="space-y-1.5 flex-1 mt-4">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                 className={`w-full flex items-center space-x-5 px-8 py-5 rounded-[30px] transition-all group relative ${
                   activeTab === tab.id 
                    ? 'bg-white text-purple-600 shadow-2xl border border-purple-50 translate-x-2' 
                    : 'text-gray-400 hover:text-gray-600 hover:translate-x-1'
                 }`}
               >
                 <div className={`transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <tab.icon />
                 </div>
                 <div className="text-left">
                    <p className="font-black text-[11px] uppercase tracking-widest leading-none">{tab.label}</p>
                    <p className={`text-[8px] font-medium mt-1 truncate max-w-[140px] ${activeTab === tab.id ? 'text-purple-400' : 'text-gray-300'}`}>{tab.desc}</p>
                 </div>
                 {activeTab === tab.id && (
                   <div className="absolute right-6 w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                 )}
               </button>
             ))}
          </div>
          
          <div className="mt-10 p-6 bg-white border border-gray-100 rounded-[32px] shadow-xl shadow-gray-100">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Profile Rank</p>
                <p className="text-[10px] font-black text-green-600">PRO</p>
             </div>
             <div className="h-2 bg-gray-50 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 w-[85%]"></div>
             </div>
             <p className="text-[8px] text-gray-400 font-medium">85% Verification Score</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-3/4 p-16 flex flex-col relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16 border-b border-gray-50 pb-16">
            <div>
              <h3 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 capitalize">
                {activeTab === 'brandkit' ? 'Global Assets' : `${activeTab} Hub`}
              </h3>
              <p className="text-gray-500 font-medium text-xl max-w-2xl">
                 {tabs.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {saveStatus && (
                <div className="px-8 py-4 bg-purple-50 text-purple-600 border border-purple-100 rounded-[24px] font-black text-[10px] uppercase tracking-widest animate-in zoom-in duration-300 shadow-xl shadow-purple-50">
                  {saveStatus}
                </div>
              )}
              {(activeTab !== 'security' && activeTab !== 'brandkit' && activeTab !== 'showcase' && activeTab !== 'social') && (
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`px-12 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-3xl ${
                    isEditing ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  {isSaving ? 'Synchronizing...' : isEditing ? 'Push to Cloud' : 'Edit Identity'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {renderTabContent()}
          </div>
          
          {/* Subtle Decorative Gradient */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-[120px] -mr-48 -mb-48 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
