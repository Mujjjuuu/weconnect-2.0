
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
      className="relative aspect-[9/16] bg-gray-900 rounded-[32px] overflow-hidden group shadow-xl transition-all cursor-pointer will-change-transform border border-gray-100/10"
    >
      <video 
        ref={videoRef}
        src={videoUrl} 
        className="w-full h-full object-cover" 
        muted 
        loop 
        playsInline
      />
      <div className={`absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-white text-[7px] font-black uppercase tracking-widest border border-white/10 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         Asset #{index + 1}
      </div>
      <div className={`absolute top-4 right-4 z-20 transition-all duration-500 ${isHovered ? 'scale-105 opacity-100' : 'scale-90 opacity-60'}`}>
        <img src={avatarUrl} className="w-10 h-10 rounded-full border-2 border-white shadow-lg" alt="creator" />
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

  const creatorAttributes = [
    { label: "UGC Expert", icon: "✨" },
    { label: "4K Master", icon: "🎥" },
    { label: "Algorithm Safe", icon: "🛡️" },
    { label: "Gen-Z Focus", icon: "⚡" },
    { label: "Fast Delivery", icon: "⏱️" },
    { label: "High Retention", icon: "📊" }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center space-x-3 text-gray-400 hover:text-purple-600 font-black text-[10px] uppercase tracking-[0.2em] mb-12 transition-all group"
      >
        <div className="group-hover:-translate-x-1 transition-transform">
          <Icons.ChevronLeft />
        </div>
        <span>Back to Fleet</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[48px] p-10 lg:p-12 shadow-3xl border border-gray-50 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            
            <div className="relative mb-8 group">
              <img 
                src={influencer.avatar} 
                className="w-48 h-48 lg:w-56 lg:h-56 rounded-[56px] object-cover shadow-3xl ring-[10px] ring-purple-50 transition-transform duration-700 group-hover:scale-105" 
                alt={influencer.name} 
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                <Icons.Plus />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3 truncate max-w-full">{influencer.name}</h1>
            <div className="flex items-center space-x-2 mb-8">
               <span className="text-purple-600 font-black uppercase tracking-[0.15em] text-[9px] bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">{influencer.handle}</span>
               <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white shadow-lg">✓</div>
            </div>
            
            <p className="text-gray-500 font-medium leading-relaxed mb-10 text-base lg:text-lg">
              {influencer.bio || `Verified WeConnect creator specializing in ${influencer.niche.join(' & ')} content.`}
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              <div className="bg-gray-50 p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-inner">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Audience</p>
                <p className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter truncate">
                  {ytStats ? formatCount(ytStats.followers) : influencer.followers}
                </p>
              </div>
              <div className="bg-gray-50 p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-inner">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Impact</p>
                <p className="text-2xl lg:text-3xl font-black text-purple-600 tracking-tighter truncate">
                  {ytStats ? `${ytStats.engagementRate}%` : influencer.engagementRate}
                </p>
              </div>
            </div>

            <button 
              onClick={() => onSecureDeal(influencer)}
              className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] shadow-3xl hover:bg-black transition-all active:scale-95 flex items-center justify-center space-x-3"
            >
              <span>Negotiate Now</span>
              <Icons.Robot />
            </button>
          </div>

          {/* AI Scorecard */}
          <div className="bg-gray-900 rounded-[48px] p-10 lg:p-12 text-white relative overflow-hidden shadow-3xl border border-white/5">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 text-purple-400 tracking-tight uppercase tracking-widest text-[11px]">Neural Audit</h3>
                <div className="flex items-center space-x-6 mb-8 bg-white/5 p-5 lg:p-6 rounded-[28px] border border-white/10">
                   <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl shrink-0">
                     {influencer.aiScore}
                   </div>
                   <div className="overflow-hidden">
                      <p className="font-black text-white text-base lg:text-lg leading-tight">Elite Accuracy</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1 leading-relaxed truncate">Authenticity: 98.4% Confidence</p>
                   </div>
                </div>
                
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-4">Competencies</p>
                <div className="flex flex-wrap gap-2">
                   {influencer.niche.map(n => (
                     <span key={n} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest">{n}</span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-10">
             <div>
                <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-2">Portfolio.</h2>
                <p className="text-gray-500 font-medium text-lg">Cinematic performance assets.</p>
             </div>
             <div className="flex gap-2">
                <div className="px-4 py-2 bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {displayVideos.length} Items
                </div>
                <div className="px-4 py-2 bg-green-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-green-600">
                  Secured
                </div>
             </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
             {creatorAttributes.map((attr, i) => (
               <div key={i} className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-base">{attr.icon}</span>
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{attr.label}</span>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {displayVideos.map((vid, idx) => (
              <VideoGridItem key={idx} index={idx} videoUrl={vid} avatarUrl={influencer.avatar} />
            ))}
          </div>
          
          {/* Insights */}
          <div className="bg-white rounded-[48px] p-10 lg:p-16 border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
                <Icons.Robot />
             </div>
             <div className="relative z-10">
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-8 tracking-tighter leading-none">Strategic DNA.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-600">Partnership Value</h4>
                      <p className="text-gray-600 font-medium leading-relaxed text-base lg:text-lg">
                        {influencer.name} maintains high-retention engagement in the {influencer.niche[0]} space. 
                        Style is optimized for "algorithm-friendly" hooks, 
                        resulting in a {influencer.engagementRate} impact score.
                      </p>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Metrics Matrix</h4>
                      <div className="space-y-3">
                         {[
                           { label: 'Gen-Z Reach', val: 82, color: 'bg-purple-500' },
                           { label: 'Tech Intent', val: 65, color: 'bg-blue-500' },
                           { label: 'Purchase Propensity', val: 90, color: 'bg-green-500' }
                         ].map((m, i) => (
                           <div key={i}>
                              <div className="flex justify-between mb-1.5">
                                 <span className="text-[10px] font-bold text-gray-400">{m.label}</span>
                                 <span className="text-[10px] font-black">{m.val}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                 <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }}></div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Cross-Platform */}
          <div className="bg-white rounded-[48px] p-10 lg:p-16 border border-gray-100 shadow-sm relative overflow-hidden">
             <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-8 tracking-tight relative z-10">Network Pulse.</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
               <div className={`p-8 lg:p-10 bg-red-50/40 rounded-[32px] border border-red-100/50 flex flex-col group transition-all ${ytStats ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl">
                        <Icons.Campaigns />
                     </div>
                     <div className="text-right overflow-hidden">
                        <p className="font-black text-gray-900 text-base leading-none">YouTube</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-red-600 mt-2 truncate">Active</p>
                     </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                       <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Subs</p>
                       <p className="text-3xl font-black text-gray-900 tracking-tighter truncate">
                         {ytStats ? formatCount(ytStats.followers) : influencer.followers}
                       </p>
                    </div>
                    {ytStats && (
                       <div className="text-right">
                         <p className="text-[8px] font-black text-gray-400">Impact</p>
                         <p className="text-lg font-black text-red-600 tracking-tighter">
                           {ytStats.engagementRate}%
                         </p>
                       </div>
                    )}
                  </div>
               </div>
               
               <div className={`p-8 lg:p-10 bg-purple-50/40 rounded-[32px] border border-purple-100/50 flex flex-col group transition-all ${igStats ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-xl">
                        <Icons.Discover />
                     </div>
                     <div className="text-right overflow-hidden">
                        <p className="font-black text-gray-900 text-base leading-none">Instagram</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-purple-600 mt-2 truncate">Linked</p>
                     </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                       <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Followers</p>
                       <p className="text-3xl font-black text-gray-900 tracking-tighter truncate">
                         {igStats ? formatCount(igStats.followers) : '0'}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-gray-400">ER</p>
                       <p className="text-lg font-black text-purple-600 tracking-tighter">
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
