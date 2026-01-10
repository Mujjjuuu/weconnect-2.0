
import React, { useState, useEffect, useRef } from 'react';
import { Influencer } from '../types';
import { Icons } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: '@sarahj_lifestyle',
    niche: ['Beauty', 'Lifestyle'],
    followers: '245K',
    engagementRate: '4.8%',
    aiScore: 98,
    avatar: 'https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2021/04/12/70860-536967812_tiny.mp4'],
    bio: 'Elite Lifestyle & Tech Creator for Gen Z.',
    location: 'New York, USA',
    portfolio: [],
    packages: [],
    socialStats: {
      instagram: { followers: 245000, engagementRate: 4.8, verified: true }
    },
    greeting: "Hi there! Sarah here. I saw your campaign interest. I'd love to chat about how my aesthetic fits your brand vision. Shall we collaborate?",
    systemInstruction: "You are Sarah Jenkins, a professional lifestyle and beauty influencer. You are friendly, fashionable, and selective about brand deals. You speak with a polished yet approachable tone."
  },
  {
    id: '2',
    name: 'Marcus Chen',
    handle: '@marcus_visuals',
    niche: ['Travel', 'Tech'],
    followers: '102K',
    engagementRate: '5.2%',
    aiScore: 92,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2020/09/24/50849-463121516_tiny.mp4'],
    bio: 'Cinematic storyteller and tech reviewer.',
    location: 'London, UK',
    portfolio: [],
    packages: [],
    socialStats: {
      youtube: { followers: 102000, engagementRate: 5.2, verified: true }
    },
    greeting: "Hey! Marcus Chen here. I'm all about cinematic quality and high-tech specs. What's the creative brief for the project?",
    systemInstruction: "You are Marcus Chen, a technical and cinematic influencer. You focus on gear, storytelling, and high production value. You are concise, direct, and care about technical details."
  },
  {
    id: '3',
    name: 'Emily White',
    handle: '@emily.w.art',
    niche: ['Art', 'DIY'],
    followers: '89K',
    engagementRate: '6.1%',
    aiScore: 84,
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2021/08/17/85341-588804910_tiny.mp4'],
    bio: 'Professional artist making complex art simple.',
    location: 'Paris, FR',
    portfolio: [],
    packages: [],
    greeting: "Bonjour! I'm Emily. My studio is open for creative partnerships. Do you have a project that needs an artistic touch?",
    systemInstruction: "You are Emily White, a creative and whimsical artist. You are enthusiastic about DIY and art. You use gentle, encouraging language and are very creative."
  },
  {
    id: '4',
    name: 'Jason Volt',
    handle: '@volt_fitness',
    niche: ['Fitness', 'Health'],
    followers: '512K',
    engagementRate: '3.9%',
    aiScore: 96,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2023/10/24/186358-877797743_tiny.mp4'],
    bio: 'Transforming bodies through neural-optimized routines.',
    location: 'Los Angeles, USA',
    portfolio: [],
    packages: [],
    greeting: "Let's go! Volt here. Ready to bring some real energy to your brand? I only partner with companies that share my drive. What've you got?",
    systemInstruction: "You are Jason Volt, a high-energy fitness influencer. You are motivational, intense, and very focused on health and performance. You use exclamations and strong verbs."
  }
];

const InfluencerCard: React.FC<{ inf: Influencer; onSelect: () => void; onSecureDeal: () => void }> = ({ inf, onSelect, onSecureDeal }) => {
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
      className="group relative overflow-hidden rounded-[56px] aspect-[9/16] bg-gray-900 shadow-3xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-3 cursor-pointer will-change-transform"
    >
      <img 
        src={inf.avatar} 
        alt={inf.name} 
        className={`absolute inset-0 w-full h-full object-cover grayscale-[0.1] transition-all duration-1000 ${isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`} 
        onClick={onSelect}
      />
      
      {inf.workVideos && inf.workVideos.length > 0 && (
        <video
          ref={videoRef}
          src={inf.workVideos[0]}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={onSelect}
        />
      )}

      <div className={`absolute top-8 right-8 z-30 transition-all duration-500 pointer-events-none ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'}`}>
        <img src={inf.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-2xl" alt="mini-profile" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 pointer-events-none"></div>
      
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none">
        <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl text-white text-[9px] font-black uppercase tracking-widest border border-white/20 flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span>{inf.aiScore}% Match</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-10 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 z-20">
        <div className="mb-8" onClick={onSelect}>
            <h3 className="font-black text-3xl leading-none tracking-tight mb-2">{inf.name}</h3>
            <div className="flex items-center space-x-3">
               <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{inf.handle}</span>
               {inf.socialStats?.instagram?.verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px]">✓</div>}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white/5 backdrop-blur-xl rounded-[32px] p-6 mb-8 border border-white/10 pointer-events-none">
          <div className="text-center">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Followers</p>
            <p className="font-black text-2xl tracking-tighter">{inf.followers}</p>
          </div>
          <div className="text-center border-l border-white/10">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Engagement</p>
            <p className="font-black text-2xl tracking-tighter text-purple-400">{inf.engagementRate}</p>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onSecureDeal(); }}
          className="w-full bg-white text-gray-900 font-black text-[11px] uppercase tracking-[0.3em] py-6 rounded-[28px] transition-all shadow-2xl hover:bg-purple-600 hover:text-white"
        >
          Initiate Secure Deal
        </button>
      </div>
    </div>
  );
};

const DiscoverFeed: React.FC<{ onSelectInfluencer: (inf: Influencer) => void, onSecureDeal: (inf: Influencer) => void }> = ({ onSelectInfluencer, onSecureDeal }) => {
  const [influencers, setInfluencers] = useState<Influencer[]>(MOCK_INFLUENCERS);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchCreators = async () => {
      if (!isSupabaseConfigured()) {
        setInfluencers(MOCK_INFLUENCERS);
        return;
      }
      try {
        const { data, error } = await supabase.from('influencers').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id.toString(),
            name: item.name || item.full_name || 'Creator',
            handle: item.handle,
            niche: item.niche,
            followers: item.followers,
            engagementRate: item.engagement_rate,
            aiScore: item.ai_score,
            avatar: item.avatar || item.avatar_url,
            bio: item.bio,
            location: item.location,
            workVideos: item.work_videos || [],
            portfolio: [],
            packages: [],
            greeting: item.greeting,
            systemInstruction: item.system_instruction
          }));
          setInfluencers(mapped);
        }
      } catch (e) {
        setInfluencers(MOCK_INFLUENCERS);
      }
    };
    fetchCreators();
  }, []);

  const niches = ['All', 'Beauty', 'Lifestyle', 'Travel', 'Tech', 'Fitness', 'Art'];
  const filtered = filter === 'All' ? influencers : influencers.filter(inf => inf.niche.includes(filter));

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter text-balance">Verified Marketplace.</h1>
          <p className="text-gray-500 mt-2 font-medium text-xl">Access AI-vetted creators with high-definition previews.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           {niches.map(n => (
             <button key={n} onClick={() => setFilter(n)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === n ? 'bg-purple-600 text-white shadow-2xl shadow-purple-200' : 'bg-white border border-gray-100 text-gray-500 hover:border-purple-200 shadow-sm'}`}>
               {n}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filtered.map((inf) => (
          <InfluencerCard 
            key={inf.id} 
            inf={inf} 
            onSelect={() => onSelectInfluencer(inf)} 
            onSecureDeal={() => onSecureDeal(inf)} 
          />
        ))}
      </div>
    </div>
  );
};

export default DiscoverFeed;
