
import React, { useState, useRef, useEffect } from 'react';
import { Influencer } from '../types';
import { Icons } from '../constants';
import { formatCount } from '../services/youtubeService';

interface PublicProfileViewProps {
  influencer: Influencer;
  onBack: () => void;
  onSecureDeal: (inf: Influencer) => void;
}

const VideoGridItem: React.FC<{ videoUrl: string; avatarUrl: string; index: number }> = ({ videoUrl, avatarUrl, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHovered && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ isolation: 'isolate', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
      className="relative aspect-[9/16] bg-gray-900 rounded-[48px] overflow-hidden group shadow-xl hover:scale-[1.02] transition-all cursor-pointer will-change-transform border border-gray-100/10"
    >
      <video 
        ref={videoRef}
        src={videoUrl} 
        className="w-full h-full object-cover" 
        muted 
        loop 
        playsInline
      />
      <div className={`absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-[8px] font-black uppercase tracking-widest border border-white/10 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         Portfolio Reel #{index + 1}
      </div>
      <div className={`absolute top-6 right-6 z-20 transition-all duration-500 ${isHovered ? 'scale-110 opacity-100' : 'scale-90 opacity-60'}`}>
        <img src={avatarUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-lg" alt="creator" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ influencer, onBack, onSecureDeal }) => {
  const displayVideos = (influencer.workVideos && influencer.workVideos.length > 0) 
    ? influencer.workVideos 
    : [
        'https://cdn.pixabay.com/video/2021/04/12/70860-536967812_tiny.mp4', 
        'https://cdn.pixabay.com/video/2020/09/24/50849-463121516_tiny.mp4', 
        'https://cdn.pixabay.com/video/2021/08/17/85341-588804910_tiny.mp4'
      ];

  const ytStats = influencer.socialLinks?.youtube?.stats;
  const igStats = influencer.socialLinks?.instagram?.stats;

  // Additional mock attributes for better representation
  const creatorAttributes = [
    { label: "UGC Expert", icon: "✨" },
    { label: "4K Master", icon: "🎥" },
    { label: "Algorithm Safe", icon: "🛡️" },
    { label: "Gen-Z Focus", icon: "⚡" },
    { label: "Fast Delivery", icon: "⏱️" },
    { label: "High Retention", icon: "📊" }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-12 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center space-x-3 text-gray-400 hover:text-purple-600 font-black text-[10px] uppercase tracking-[0.2em] mb-12 transition-all group"
      >
        <div className="group-hover:-translate-x-1 transition-transform">
          <Icons.ChevronLeft />
        </div>
        <span>Return to Discovery</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar: Identity & Vital Stats */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[64px] p-12 shadow-3xl border border-gray-50 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            
            <div className="relative mb-10 group">
              <img 
                src={influencer.avatar} 
                className="w-56 h-56 rounded-[64px] object-cover shadow-3xl ring-[12px] ring-purple-50 transition-transform duration-700 group-hover:scale-105" 
                alt={influencer.name} 
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl animate-bounce">
                <Icons.Plus />
              </div>
            </div>

            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3">{influencer.name}</h1>
            <div className="flex items-center space-x-3 mb-8">
               <span className="text-purple-600 font-black uppercase tracking-[0.2em] text-[10px] bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100">{influencer.handle}</span>
               <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-lg">✓</div>
            </div>
            
            <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg">
              {influencer.bio || `Specializing in high-velocity content for ${influencer.niche.join(' & ')}. Verified WeConnect elite creator.`}
            </p>

            <div className="grid grid-cols-2 gap-6 w-full mb-10">
              <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-inner">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Reach</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">
                  {ytStats ? formatCount(ytStats.followers) : influencer.followers}
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-inner">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Impact</p>
                <p className="text-3xl font-black text-purple-600 tracking-tighter">
                  {ytStats ? `${ytStats.engagementRate}%` : influencer.engagementRate}
                </p>
              </div>
            </div>

            <button 
              onClick={() => onSecureDeal(influencer)}
              className="w-full bg-gray-900 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-3xl hover:bg-black transition-all active:scale-95 flex items-center justify-center space-x-4"
            >
              <span>Negotiate with AI</span>
              <Icons.Robot />
            </button>
          </div>

          {/* AI Trust Card */}
          <div className="bg-gray-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-3xl border border-white/5">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-6 text-purple-400 tracking-tight">Neural DNA Check</h3>
                <div className="flex items-center space-x-6 mb-10 bg-white/5 p-6 rounded-[32px] border border-white/10">
                   <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[24px] flex items-center justify-center text-4xl font-black shadow-2xl">
                     {influencer.aiScore}
                   </div>
                   <div>
                      <p className="font-black text-white text-lg leading-tight">Elite Tier</p>
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">Neural audit confirms 98.4% content authenticity.</p>
                   </div>
                </div>
                
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Core Competencies</p>
                <div className="flex flex-wrap gap-2">
                   {influencer.niche.map(n => (
                     <span key={n} className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 transition-colors cursor-default">{n}</span>
                   ))}
                </div>
             </div>
          </div>
          
          {/* Quick Stats Panel */}
          <div className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm space-y-6">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsiveness</span>
                <span className="text-sm font-black text-green-600">~ 2 HOURS</span>
             </div>
             <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[95%]"></div>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Safety</span>
                <span className="text-sm font-black text-blue-600">CERTIFIED</span>
             </div>
             <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[100%]"></div>
             </div>
          </div>
        </div>

        {/* Main Content: Showcase & Strategic Insights */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-12">
             <div>
                <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-2">Content Reel.</h2>
                <p className="text-gray-500 font-medium text-xl">High-performance cinematic samples.</p>
             </div>
             <div className="flex gap-3">
                <div className="px-5 py-2.5 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {displayVideos.length} Assets
                </div>
                <div className="px-5 py-2.5 bg-purple-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-purple-600">
                  Verified
                </div>
             </div>
          </div>

          {/* Expanded Tag System */}
          <div className="flex flex-wrap gap-4 py-4">
             {creatorAttributes.map((attr, i) => (
               <div key={i} className="flex items-center space-x-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm hover:border-purple-200 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-lg">{attr.icon}</span>
                  <span className="text-[11px] font-black uppercase text-gray-600 tracking-widest">{attr.label}</span>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayVideos.map((vid, idx) => (
              <VideoGridItem key={idx} index={idx} videoUrl={vid} avatarUrl={influencer.avatar} />
            ))}
          </div>
          
          {/* Strategic Insights Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-[64px] p-16 border border-gray-100 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                <Icons.Robot />
             </div>
             <div className="relative z-10">
                <h3 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">Strategic DNA.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-600">Why Partner With Us?</h4>
                      <p className="text-gray-700 font-medium leading-relaxed text-lg">
                        {influencer.name} maintains a highly engaged, loyalty-driven audience in the {influencer.niche[0]} space. 
                        The content style is optimized for retention with cinematic editing and "algorithm-friendly" hooks, 
                        resulting in a {influencer.engagementRate} impact score that outperforms the industry average.
                      </p>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Audience Persona</h4>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Gen-Z Audience</span>
                            <span className="text-xs font-black">82%</span>
                         </div>
                         <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[82%]"></div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Tech Enthusiasts</span>
                            <span className="text-xs font-black">65%</span>
                         </div>
                         <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[65%]"></div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Purchasing Intent</span>
                            <span className="text-xs font-black">HIGH</span>
                         </div>
                         <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[90%]"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Social Presence Matrix */}
          <div className="bg-white rounded-[64px] p-16 border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-40"></div>
             <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight relative z-10">Cross-Platform Pulse.</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
               <div className={`p-10 bg-red-50/50 rounded-[48px] border border-red-100 flex flex-col transition-all group hover:shadow-2xl hover:bg-red-50 ${ytStats ? 'opacity-100 scale-100' : 'opacity-40 grayscale'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-red-600 shadow-xl group-hover:scale-110 transition-transform">
                        <Icons.Campaigns />
                     </div>
                     <div className="text-right">
                        <p className="font-black text-gray-900 text-lg leading-none">YouTube</p>
                        <p className={`font-black uppercase mt-2 text-[10px] tracking-widest ${ytStats ? 'text-red-600' : 'text-gray-400'}`}>
                           {ytStats ? 'Neural Protocol Active' : 'Unlinked Gateway'}
                        </p>
                     </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Subscribers</p>
                       <p className="text-4xl font-black text-gray-900 tracking-tighter">
                         {ytStats ? formatCount(ytStats.followers) : influencer.followers}
                       </p>
                    </div>
                    {ytStats && (
                       <div className="text-right">
                         <p className="text-[9px] font-black uppercase text-gray-400">Total Imprints</p>
                         <p className="text-xl font-black text-red-600 tracking-tighter">
                           {formatCount(ytStats.avgLikes * (ytStats.followers / 8))}
                         </p>
                       </div>
                    )}
                  </div>
               </div>
               
               <div className={`p-10 bg-purple-50/50 rounded-[48px] border border-purple-100 flex flex-col transition-all group hover:shadow-2xl hover:bg-purple-50 ${igStats ? 'opacity-100 scale-100' : 'opacity-40 grayscale'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-purple-600 shadow-xl group-hover:scale-110 transition-transform">
                        <Icons.Discover />
                     </div>
                     <div className="text-right">
                        <p className="font-black text-gray-900 text-lg leading-none">Instagram</p>
                        <p className={`font-black uppercase mt-2 text-[10px] tracking-widest ${igStats ? 'text-purple-600' : 'text-gray-400'}`}>
                           {igStats ? 'API Handshake Verified' : 'Standard Feed'}
                        </p>
                     </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Followers</p>
                       <p className="text-4xl font-black text-gray-900 tracking-tighter">
                         {igStats ? formatCount(igStats.followers) : '0'}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase text-gray-400">Engagement</p>
                       <p className="text-xl font-black text-purple-600 tracking-tighter">
                         {igStats ? `${igStats.engagementRate}%` : '—'}
                       </p>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileView;
