
import React, { useState } from 'react';
import { Icons } from '../constants';
import { getMatchAnalysis } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const MOCK_FALLBACK: any[] = [
  { id: '1', name: 'Sarah Jenkins', handle: '@sarahj_lifestyle', niche: ['Beauty', 'Lifestyle'], followers: '245K', engagementRate: '4.8%', avatar: 'https://picsum.photos/seed/sarah/200' },
  { id: '2', name: 'Marcus Chen', handle: '@marcus_visuals', niche: ['Travel', 'Tech'], followers: '102K', engagementRate: '5.2%', avatar: 'https://picsum.photos/seed/marcus/200' },
  { id: '3', name: 'Emily White', handle: '@emily.w.art', niche: ['Art', 'DIY'], followers: '89K', engagementRate: '6.1%', avatar: 'https://picsum.photos/seed/emily/200' }
];

const MatchingSystem: React.FC = () => {
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
        if (data && data.length > 0) {
          candidates = data.map(d => ({
            ...d,
            engagementRate: d.engagement_rate,
            aiScore: d.ai_score
          }));
        } else {
          candidates = MOCK_FALLBACK;
        }
      } else {
        candidates = MOCK_FALLBACK;
      }

      await new Promise(r => setTimeout(r, 2000));

      const matchPromises = candidates.map(async (inf) => {
        let score = 75 + Math.floor(Math.random() * 20);
        const explanation = await getMatchAnalysis(requirements, inf);
        
        return {
          ...inf,
          matchScore: score,
          aiReasoning: explanation,
          topTrait: score > 90 ? 'High Success Chance' : 'Good Fit'
        };
      });

      const finalMatches = await Promise.all(matchPromises);
      setMatches(finalMatches.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
      console.error("Match error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Input Panel */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[48px] p-12 shadow-sm border border-gray-100 relative overflow-hidden">
            <h2 className="text-4xl font-black text-gray-900 mb-10 tracking-tight leading-none">Find Your Match.</h2>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">What's your niche?</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 text-sm font-black text-gray-900 appearance-none shadow-inner"
                  value={requirements.niche}
                  onChange={e => setRequirements({...requirements, niche: e.target.value})}
                >
                  <option>Beauty</option>
                  <option>Tech & Gaming</option>
                  <option>Travel & Lifestyle</option>
                  <option>Fitness</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">What's the goal?</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[24px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 text-sm font-black text-gray-900 appearance-none shadow-inner"
                  value={requirements.goal}
                  onChange={e => setRequirements({...requirements, goal: e.target.value})}
                >
                  <option>Increase Awareness</option>
                  <option>Drive More Sales</option>
                  <option>Get Content (UGC)</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Tell us more</label>
                <textarea 
                  placeholder="Tell us about the ideal person you want to work with..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-6 outline-none focus:ring-4 focus:ring-purple-100 transition-all text-sm min-h-[180px] resize-none font-bold text-gray-900 shadow-inner leading-relaxed"
                  value={requirements.brief}
                  onChange={e => setRequirements({...requirements, brief: e.target.value})}
                />
              </div>

              <button 
                onClick={findMatches}
                disabled={isSearching}
                className="w-full bg-purple-600 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-3xl shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-4"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Icons.Robot />
                    <span>Find My Matches</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8">
          {!hasSearched ? (
            <div className="h-full min-h-[700px] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[64px] border border-gray-100 border-dashed">
              <div className="w-32 h-32 bg-purple-50 rounded-[40px] flex items-center justify-center text-purple-600 mb-10 shadow-inner">
                <Icons.Robot />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Ready to search.</h3>
              <p className="text-gray-500 max-w-sm font-medium leading-relaxed text-lg">Enter your details on the left to find your perfect creator matches.</p>
            </div>
          ) : isSearching ? (
            <div className="space-y-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-12 rounded-[56px] border border-gray-100 flex animate-pulse items-center gap-12">
                  <div className="w-40 h-40 bg-gray-50 rounded-[40px] shrink-0"></div>
                  <div className="flex-1 space-y-6">
                    <div className="h-10 bg-gray-50 rounded-2xl w-1/3"></div>
                    <div className="h-6 bg-gray-50 rounded-xl w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-6">
                <div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{matches.length} Matches Found</h3>
                  <p className="text-gray-500 font-medium mt-2">These creators match your requirements best.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {matches.map((match, idx) => (
                  <div key={idx} className="bg-white p-12 rounded-[64px] border border-gray-100 shadow-sm hover:shadow-3xl transition-all flex flex-col md:flex-row items-center md:items-start group relative overflow-hidden">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-10 md:mb-0 mr-0 md:mr-12 shrink-0">
                      <div className="relative">
                        <img src={match.avatar} className="w-44 h-44 rounded-[48px] object-cover shadow-3xl" alt="" />
                        <div className="absolute -bottom-6 -right-6 bg-purple-600 text-white w-20 h-20 flex flex-col items-center justify-center rounded-3xl font-black border-[8px] border-white shadow-3xl">
                          <span className="text-[10px] opacity-60 uppercase tracking-widest leading-none mb-1">Match</span>
                          <span className="text-2xl leading-none">{match.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div>
                          <h4 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3">{match.name}</h4>
                          <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">{match.handle} • {match.niche.join(', ')}</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="px-8 py-4 bg-gray-50 rounded-[24px] text-center border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                             <p className="font-black text-gray-900 text-xl tracking-tighter">{match.followers}</p>
                           </div>
                           <div className="px-8 py-4 bg-gray-50 rounded-[24px] text-center border border-gray-100">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                             <p className="font-black text-purple-600 text-xl tracking-tighter">{match.engagementRate}</p>
                           </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
                        <h5 className="text-[10px] font-black uppercase text-purple-400 mb-4 tracking-[0.3em]">AI Why This Works</h5>
                        <p className="text-base text-gray-300 leading-relaxed font-bold italic opacity-90">
                          "{match.aiReasoning}"
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <button className="bg-gray-900 text-white px-12 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">
                          Start Work
                        </button>
                        <button className="bg-white border-2 border-gray-100 text-gray-700 px-12 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:border-purple-200 transition-all">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingSystem;
