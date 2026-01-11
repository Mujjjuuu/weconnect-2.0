
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
      instagram: { followers: 245000, engagementRate: 4.8, verified: true },
      youtube: { followers: 120000, engagementRate: 3.2, verified: false }
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
      youtube: { followers: 102000, engagementRate: 5.2, verified: true },
      instagram: { followers: 45000, engagementRate: 4.1, verified: true }
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
    socialStats: {
      instagram: { followers: 89000, engagementRate: 6.1, verified: true },
      tiktok: { followers: 150000, engagementRate: 8.4, verified: false }
    },
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
    socialStats: {
      instagram: { followers: 512000, engagementRate: 3.9, verified: true },
      youtube: { followers: 800000, engagementRate: 2.1, verified: true }
    },
    greeting: "Let's go! Volt here. Ready to bring some real energy to your brand? I only partner with companies that share my drive. What've you got?",
    systemInstruction: "You are Jason Volt, a high-energy fitness influencer. You are motivational, intense, and very focused on health and performance. You use exclamations and strong verbs."
  },
  {
    id: '5',
    name: 'Alex Rivera',
    handle: '@alex_plays',
    niche: ['Gaming', 'Tech'],
    followers: '1.2M',
    engagementRate: '7.4%',
    aiScore: 99,
    avatar: 'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2022/10/05/133649-756910609_tiny.mp4'],
    bio: 'Top-tier esports athlete and PC hardware enthusiast.',
    location: 'Seoul, SK',
    portfolio: [],
    packages: [],
    socialStats: {
      youtube: { followers: 1200000, engagementRate: 7.4, verified: true },
      tiktok: { followers: 2000000, engagementRate: 9.1, verified: true }
    },
    greeting: "GG! I'm Alex. Always looking for the next piece of gear to give me an edge. Want to collab on some high-performance content?",
    systemInstruction: "You are Alex Rivera, a professional gamer. You use gaming slang, are very energetic, and talk a lot about frame rates, RGB lighting, and skill-based competition."
  },
  {
    id: '6',
    name: 'Maya Sharma',
    handle: '@maya_wellness',
    niche: ['Health', 'Lifestyle'],
    followers: '330K',
    engagementRate: '5.5%',
    aiScore: 91,
    avatar: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2021/05/20/74929-553641774_tiny.mp4'],
    bio: 'Yoga instructor and mindfulness coach helping you find your center.',
    location: 'Bali, ID',
    portfolio: [],
    packages: [],
    socialStats: {
      instagram: { followers: 330000, engagementRate: 5.5, verified: true },
      youtube: { followers: 150000, engagementRate: 4.8, verified: false }
    },
    greeting: "Namaste. I am Maya. My community values authenticity and inner peace. How can we work together to bring more light into the world?",
    systemInstruction: "You are Maya Sharma, a serene and mindful wellness influencer. Your tone is calm, spiritual, and deeply encouraging. You prioritize holistic health and mental well-being."
  },
  {
    id: '7',
    name: 'David Cole',
    handle: '@cole_capital',
    niche: ['Finance', 'Tech'],
    followers: '156K',
    engagementRate: '4.2%',
    aiScore: 88,
    avatar: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2020/07/28/45791-445892552_tiny.mp4'],
    bio: 'Breaking down market trends and high-growth investment strategies.',
    location: 'Chicago, USA',
    portfolio: [],
    packages: [],
    socialStats: {
      youtube: { followers: 156000, engagementRate: 4.2, verified: true },
      instagram: { followers: 88000, engagementRate: 3.1, verified: false }
    },
    greeting: "Cole here. The markets are moving fast. If you've got a fintech product or a platform that adds real value, let's talk numbers.",
    systemInstruction: "You are David Cole, a sharp-witted finance influencer. You are data-driven, business-oriented, and value time. You speak in a direct, professional, and slightly authoritative manner."
  },
  {
    id: '8',
    name: 'Chloe Dubois',
    handle: '@chloe_couture',
    niche: ['Fashion', 'Lifestyle'],
    followers: '680K',
    engagementRate: '3.5%',
    aiScore: 95,
    avatar: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2023/11/27/190884-888497672_tiny.mp4'],
    bio: 'High fashion editorial and luxury lifestyle curation.',
    location: 'Paris, FR',
    portfolio: [],
    packages: [],
    socialStats: {
      instagram: { followers: 680000, engagementRate: 3.5, verified: true },
      tiktok: { followers: 900000, engagementRate: 5.2, verified: true }
    },
    greeting: "Bonjour darling. Chloe Dubois here. My audience demands nothing but the most exquisite aesthetics. Is your brand ready for the runway?",
    systemInstruction: "You are Chloe Dubois, a sophisticated luxury fashion influencer. You use words like 'exquisite', 'curated', and 'aesthetic'. You are polite but have very high standards for quality."
  },
  {
    id: '9',
    name: 'Chef Luca',
    handle: '@luca_kitchen',
    niche: ['Food', 'Lifestyle'],
    followers: '890K',
    engagementRate: '6.8%',
    aiScore: 93,
    avatar: 'https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2021/04/09/70498-536338148_tiny.mp4'],
    bio: 'Modern twists on traditional Italian recipes. Simple, fresh, and delicious.',
    location: 'Rome, IT',
    portfolio: [],
    packages: [],
    socialStats: {
      youtube: { followers: 890000, engagementRate: 6.8, verified: true },
      instagram: { followers: 420000, engagementRate: 5.4, verified: true }
    },
    greeting: "Ciao! Chef Luca here. In my kitchen, we only use the best ingredients. If you have a product that tastes amazing, let's cook something up!",
    systemInstruction: "You are Chef Luca, a passionate and friendly culinary influencer. You are warm, hospitable, and talk enthusiastically about flavors, freshness, and the joy of cooking."
  },
  {
    id: '10',
    name: 'Zoe Green',
    handle: '@zoe_eco',
    niche: ['Lifestyle', 'Travel'],
    followers: '115K',
    engagementRate: '8.2%',
    aiScore: 97,
    avatar: 'https://images.pexels.com/photos/343717/pexels-photo-343717.jpeg?auto=compress&cs=tinysrgb&w=800',
    workVideos: ['https://cdn.pixabay.com/video/2023/11/02/187425-880290510_tiny.mp4'],
    bio: 'Sustainable living advocate and eco-traveler. Let\'s save the planet in style.',
    location: 'Vancouver, CA',
    portfolio: [],
    packages: [],
    socialStats: {
      instagram: { followers: 115000, engagementRate: 8.2, verified: true },
      tiktok: { followers: 230000, engagementRate: 9.5, verified: false }
    },
    greeting: "Hey! Zoe here. I'm dedicated to circular fashion and zero-waste travel. Do you have a sustainable solution for my community?",
    systemInstruction: "You are Zoe Green, a dedicated eco-conscious influencer. You are idealistic, knowledgeable about sustainability, and very protective of your audience against greenwashing."
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
      className="group relative overflow-hidden rounded-[40px] aspect-[4/5] bg-gray-900 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer will-change-transform border border-gray-100/10"
    >
      <img 
        src={inf.avatar} 
        alt={inf.name} 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isHovered ? 'opacity-0 scale-110 blur-lg' : 'opacity-100 scale-100'}`} 
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

      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:via-black/40"></div>
      
      {/* Top Badges */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-30">
        <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-xl text-white text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span>{inf.aiScore}% Match</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all pointer-events-auto">
           <Icons.ChevronRight />
        </button>
      </div>

      {/* Bottom Content - Fixed for Font Protrusion */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
        <div className="mb-4" onClick={onSelect}>
            <h3 className="font-black text-2xl leading-none tracking-tight mb-1 truncate max-w-full">{inf.name}</h3>
            <div className="flex items-center space-x-2 overflow-hidden">
               <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest truncate">{inf.handle}</span>
               {inf.socialStats?.instagram?.verified && <div className="shrink-0 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px]">✓</div>}
            </div>
        </div>

        {/* Info Grid - Re-balanced */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl py-3 px-4 border border-white/10">
            <p className="text-[7px] font-black uppercase tracking-widest opacity-50 mb-0.5">Reach</p>
            <p className="font-black text-xl tracking-tighter leading-none">{inf.followers}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl py-3 px-4 border border-white/10">
            <p className="text-[7px] font-black uppercase tracking-widest opacity-50 mb-0.5">Impact</p>
            <p className="font-black text-xl tracking-tighter leading-none text-purple-400">{inf.engagementRate}</p>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onSecureDeal(); }}
          className="w-full bg-white text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-[18px] transition-all shadow-xl hover:bg-purple-600 hover:text-white active:scale-95"
        >
          Secure Deal
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
            systemInstruction: item.system_instruction,
            socialStats: item.social_stats || {}
          }));
          setInfluencers(mapped);
        }
      } catch (e) {
        setInfluencers(MOCK_INFLUENCERS);
      }
    };
    fetchCreators();
  }, []);

  const niches = ['All', 'Beauty', 'Lifestyle', 'Travel', 'Tech', 'Fitness', 'Art', 'Gaming', 'Food', 'Health', 'Fashion'];
  const filtered = filter === 'All' ? influencers : influencers.filter(inf => inf.niche.includes(filter));

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter text-balance">Neural Feed.</h1>
          <p className="text-gray-500 mt-3 font-medium text-xl">Access AI-vetted creators with cinematic precision.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {niches.map(n => (
             <button key={n} onClick={() => setFilter(n)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === n ? 'bg-purple-600 text-white shadow-xl shadow-purple-100' : 'bg-white border border-gray-100 text-gray-400 hover:border-purple-200 shadow-sm'}`}>
               {n}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
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
