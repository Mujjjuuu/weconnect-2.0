
import React, { useState, useRef, useEffect } from 'react';
import { Influencer } from '../types';
import { Icons } from '../constants';

interface PublicProfileViewProps {
  influencer: Influencer;
  onBack: () => void;
  onSecureDeal: () => void;
}

const VideoGridItem = ({ videoUrl, avatarUrl }: { videoUrl: string, avatarUrl: string }) => {
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
      className="relative aspect-[9/16] bg-gray-900 rounded-[48px] overflow-hidden group shadow-xl hover:scale-[1.02] transition-all cursor-pointer will-change-transform"
    >
      <video 
        ref={videoRef}
        src={videoUrl} 
        className="w-full h-full object-cover" 
        muted 
        loop 
        playsInline
      />
      {/* Profile Photo Overlay */}
      <div className={`absolute top-6 right-6 z-20 transition-all duration-500 ${isHovered ? 'scale-110 opacity-100' : 'scale-90 opacity-60'}`}>
        <img src={avatarUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-lg" alt="creator" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ influencer, onBack, onSecureDeal }) => {
  // Use mock videos if influencer has none for testing
  const displayVideos = (influencer.workVideos && influencer.workVideos.length > 0) 
    ? influencer.workVideos 
    : [
        'https://cdn.pixabay.com/video/2021/04/12/70860-536967812_tiny.mp4', 
        'https://cdn.pixabay.com/video/2020/09/24/50849-463121516_tiny.mp4', 
        'https://cdn.pixabay.com/video/2021/08/17/85341-588804910_tiny.mp4'
      ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-12 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center space-x-3 text-gray-400 hover:text-purple-600 font-black text-xs uppercase tracking-widest mb-12 transition-colors"
      >
        <Icons.Close />
        <span>Back to Discovery</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[64px] p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <img 
              src={influencer.avatar} 
              className="w-56 h-56 rounded-[64px] object-cover shadow-3xl mb-10 ring-8 ring-purple-50" 
              alt={influencer.name} 
            />
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4">{influencer.name}</h1>
            <p className="text-xl font-bold text-purple-600 mb-8 uppercase tracking-widest text-xs">{influencer.handle}</p>
            
            <p className="text-gray-500 font-medium leading-relaxed mb-10 max-w-sm">
              {influencer.bio || "Verified WeConnect Content Creator ready for your next big campaign."}
            </p>

            <div className="grid grid-cols-2 gap-6 w-full mb-10">
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{influencer.followers}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                <p className="text-3xl font-black text-purple-600 tracking-tighter">{influencer.engagementRate}</p>
              </div>
            </div>

            <button 
              onClick={onSecureDeal}
              className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center space-x-3"
            >
              <span>Initiate Secure Deal</span>
              <Icons.Wallet />
            </button>
          </div>

          <div className="bg-gray-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 text-purple-400">AI Trust Score</h3>
                <div className="flex items-center space-x-6 mb-8">
                   <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl font-black">{influencer.aiScore}</div>
                   <div>
                      <p className="font-bold text-gray-300">Market Potential: High</p>
                      <p className="text-sm text-gray-500">Verified audience retention and authentic content delivery.</p>
                   </div>
                </div>
                <div className="flex flex-wrap gap-2">
                   {influencer.niche.map(n => (
                     <span key={n} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{n}</span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Content Showcase */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex justify-between items-end">
             <div>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Content Showcase.</h2>
                <p className="text-gray-500 mt-2 font-medium text-xl">Recent work and content style samples.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayVideos.map((vid, idx) => (
              <VideoGridItem key={idx} videoUrl={vid} avatarUrl={influencer.avatar} />
            ))}
          </div>
          
          <div className="bg-white rounded-[64px] p-12 border border-gray-100 shadow-sm">
             <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Social Connectivity</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                        <Icons.Discover />
                     </div>
                     <div>
                        <p className="font-black text-gray-900 leading-none">Instagram</p>
                        <p className="text-xs text-purple-600 font-black uppercase mt-1">Verified</p>
                     </div>
                  </div>
                  <p className="text-xl font-black text-gray-900 tracking-tighter">{influencer.followers}</p>
               </div>
               <div className="p-8 bg-red-50 rounded-[40px] border border-red-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                        <Icons.Campaigns />
                     </div>
                     <div>
                        <p className="font-black text-gray-900 leading-none">YouTube</p>
                        <p className="text-xs text-red-600 font-black uppercase mt-1">Verified</p>
                     </div>
                  </div>
                  <p className="text-xl font-black text-gray-900 tracking-tighter">89K</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileView;
