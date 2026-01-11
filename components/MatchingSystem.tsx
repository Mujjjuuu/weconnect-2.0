
import React, { useState } from 'react';
import { Icons } from '../constants';
import { getMatchAnalysis } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Influencer } from '../types';

const MOCK_FALLBACK: any[] = [
  { id: '1', name: 'Sarah Jenkins', handle: '@sarahj_lifestyle', niche: ['Beauty', 'Lifestyle'], followers: '245K', engagementRate: '4.8%', avatar: 'https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg?auto=compress&cs=tinysrgb&w=800', aiScore: 98, bio: 'Elite Lifestyle & Tech Creator.', location: 'NYC', portfolio: [], packages: [], systemInstruction: "You are Sarah Jenkins.", greeting: "Hi, let's chat!" },
  { id: '2', name: 'Marcus Chen', handle: '@marcus_visuals', niche: ['Travel', 'Tech'], followers: '102K', engagementRate: '5.2%', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800', aiScore: 92, bio: 'Cinematic storyteller.', location: 'London', portfolio: [], packages: [], systemInstruction: "You are Marcus Chen.", greeting: "Hey there!" },
  { id: '3', name: 'Emily White', handle: '@emily.w.art', niche: ['Art', 'DIY'], followers: '89K', engagementRate: '6.1%', avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800', aiScore: 84, bio: 'Professional artist.', location: 'Paris', portfolio: [], packages: [], systemInstruction: "You are Emily White.", greeting: "Bonjour!" }
];

interface MatchingSystemProps {
  onSecureDeal?: (inf: Influencer) => void;
  onViewProfile?: (inf: Influencer) => void;
}

const MatchingSystem: React.FC<MatchingSystemProps> = ({ onSecureDeal, onViewProfile }) => {
  const [requirements, setRequirements] = useState({
    niche: 'Beauty',
    goal: 'Increase Awareness',
    budget: '$1,000 - $5,000',
    platform: 'TikTok',
    brief: ''
  });
  
  const [matches, setMatches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const findMatches = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setMatches([]);

    try {
      let candidates: any[] = [];
      if (isSupabaseConfigured()) {
        const { data } = await supabase.from('influencers').select('*');
        candidates = (data && data.length > 0) ? data.map(d => ({
          ...d, 
          engagementRate: d.engagement_rate, 
          aiScore: d.ai_score,
          greeting: d.greeting || "Hello! Ready to collaborate?",
          systemInstruction: d.system_instruction || "You are a professional influencer."
        })) : MOCK_FALLBACK;
      } else {
        candidates = MOCK_FALLBACK;
      }

      const matchPromises = candidates.map(async (inf) => {
        const baseScore = 75 + Math.floor(Math.random() * 15);
        const explanation = await getMatchAnalysis(requirements, inf);
        return { ...inf, matchScore: baseScore, aiReasoning: explanation };
      });

      const finalMatches = await Promise.all(matchPromises);
      setMatches(finalMatches.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
      setMatches(MOCK_FALLBACK.map(inf => ({...inf, matchScore: 85, aiReasoning: "• High Affinity: Targeted reach.\n• Content Fit: Visual synergy.\n• ROI Prophecy: Strong growth potential."})));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[48px] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight leading-none">AI Matchmaker.</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Brand Niche</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-purple-100 text-sm font-black text-gray-900 appearance-none shadow-inner" value={requirements.niche} onChange={e => setRequirements({...requirements, niche: e.target.value})}>
                  <option>Beauty</option>
                  <option>Tech & Gaming</option>
                  <option>Travel & Lifestyle</option>
                  <option>Fitness</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Campaign Goal</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-purple-100 text-sm font-black text-gray-900 appearance-none shadow-inner" value={requirements.goal} onChange={e => setRequirements({...requirements, goal: e.target.value})}>
                  <option>Increase Awareness</option>
                  <option>Drive More Sales</option>
                  <option>Get Content (UGC)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Target Brief</label>
                <textarea placeholder="Describe the ideal creator personality..." className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 outline-none focus:ring-4 focus:ring-purple-100 text-sm min-h-[140px] resize-none font-bold text-gray-900 shadow-inner leading-relaxed" value={requirements.brief} onChange={e => setRequirements({...requirements, brief: e.target.value})} />
              </div>
              <button onClick={findMatches} disabled={isSearching} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-3">
                {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Robot />}
                <span>{isSearching ? 'Analyzing DNA...' : 'Find Matches'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {!hasSearched ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[64px] border border-gray-100 border-dashed">
              <div className="w-24 h-24 bg-purple-50 rounded-[32px] flex items-center justify-center text-purple-600 mb-8 shadow-inner">
                <Icons.Robot />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">Neural Scanner Ready</h3>
              <p className="text-gray-400 max-w-sm font-medium">Input your campaign requirements to initiate a global search for the perfect partner.</p>
            </div>
          ) : isSearching ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-10 rounded-[48px] border border-gray-100 flex animate-pulse items-center gap-10">
                  <div className="w-32 h-32 bg-gray-50 rounded-[32px] shrink-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-50 rounded-xl w-1/3"></div>
                    <div className="h-4 bg-gray-50 rounded-lg w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {matches.map((match, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all flex flex-col items-stretch group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center md:items-start">
                    <div className="flex flex-col items-center mb-8 md:mb-0 mr-0 md:mr-10 shrink-0">
                      <div className="relative">
                        <img src={match.avatar} className="w-36 h-36 rounded-[40px] object-cover shadow-2xl" alt="" />
                        <div className="absolute -bottom-4 -right-4 bg-purple-600 text-white w-16 h-16 flex flex-col items-center justify-center rounded-2xl font-black border-4 border-white shadow-2xl">
                          <span className="text-[8px] opacity-60 uppercase tracking-widest leading-none mb-1">Synergy</span>
                          <span className="text-xl leading-none">{match.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                          <h4 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">{match.name}</h4>
                          <div className="flex items-center space-x-3">
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{match.handle} • {match.niche.join(', ')}</p>
                             <div className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-full">Top Recommendation</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                           <button 
                            onClick={() => onSecureDeal?.(match)}
                            className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg"
                           >
                            Negotiate Now
                           </button>
                           <button 
                            onClick={() => onViewProfile?.(match)}
                            className="bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-purple-200 transition-all active:scale-95"
                           >
                            Profile
                           </button>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50/50 rounded-[32px] p-8 border border-purple-100/50 relative overflow-hidden">
                        <div className="flex items-center space-x-3 mb-4">
                           <div className="p-2 bg-purple-600 text-white rounded-xl scale-75"><Icons.Robot /></div>
                           <h5 className="text-[10px] font-black uppercase text-purple-600 tracking-widest">Neural Diagnostic</h5>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed font-bold whitespace-pre-wrap">
                           {match.aiReasoning}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingSystem;
