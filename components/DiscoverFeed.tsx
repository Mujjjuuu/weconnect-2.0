
import React, { useState, useEffect } from 'react';
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
    avatar: 'https://picsum.photos/seed/sarah/200',
    bio: 'Lifestyle & Tech Creator for Gen Z.',
    location: 'New York, USA',
    portfolio: ['https://picsum.photos/seed/sarah1/400/700'],
    packages: []
  },
  {
    id: '2',
    name: 'Marcus Chen',
    handle: '@marcus_visuals',
    niche: ['Travel', 'Tech'],
    followers: '102K',
    engagementRate: '5.2%',
    aiScore: 92,
    avatar: 'https://picsum.photos/seed/marcus/200',
    bio: 'Cinematic storyteller and tech reviewer.',
    location: 'London, UK',
    portfolio: ['https://picsum.photos/seed/marcus1/400/700'],
    packages: []
  },
  {
    id: '3',
    name: 'Emily White',
    handle: '@emily.w.art',
    niche: ['Art', 'DIY'],
    followers: '89K',
    engagementRate: '6.1%',
    aiScore: 84,
    avatar: 'https://picsum.photos/seed/emily/200',
    bio: 'Professional artist making complex art simple.',
    location: 'Paris, FR',
    portfolio: ['https://picsum.photos/seed/emily1/400/700'],
    packages: []
  }
];

const DiscoverFeed: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>(MOCK_INFLUENCERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        setInfluencers(MOCK_INFLUENCERS);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.from('influencers').select('*');
        if (error) {
          setInfluencers(MOCK_INFLUENCERS);
        } else if (data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            handle: item.handle,
            niche: item.niche,
            followers: item.followers,
            engagementRate: item.engagement_rate,
            aiScore: item.ai_score,
            avatar: item.avatar,
            bio: item.bio,
            location: item.location,
            portfolio: [item.avatar],
            packages: []
          }));
          setInfluencers(mapped);
        }
      } catch (e) {
        setInfluencers(MOCK_INFLUENCERS);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Discover Real Talent</h1>
          <p className="text-gray-500 mt-2">Verified creators synced from WeConnect Database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {influencers.map((inf) => (
          <div key={inf.id} className="relative group overflow-hidden rounded-[32px] aspect-[9/16] bg-gray-200 shadow-xl transition-transform hover:scale-[1.02]">
            <img src={inf.avatar} alt={inf.name} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30"></div>
            
            <div className="absolute top-4 left-4">
              <div className="bg-purple-600/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                {inf.aiScore}% Neural Score
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <img src={inf.avatar} alt={inf.handle} className="w-10 h-10 rounded-full border-2 border-white" />
                <div>
                  <h3 className="font-bold text-lg leading-tight">{inf.name}</h3>
                  <p className="text-xs opacity-70">{inf.handle}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-4">
                <div className="text-center flex-1">
                  <p className="text-[9px] uppercase tracking-wider opacity-60">Reach</p>
                  <p className="font-bold text-sm">{inf.followers}</p>
                </div>
                <div className="w-[1px] h-6 bg-white/20"></div>
                <div className="text-center flex-1">
                  <p className="text-[9px] uppercase tracking-wider opacity-60">Engage</p>
                  <p className="font-bold text-sm">{inf.engagementRate}</p>
                </div>
              </div>

              <button className="w-full bg-white text-purple-700 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg hover:bg-purple-50">
                View Portfolio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverFeed;
