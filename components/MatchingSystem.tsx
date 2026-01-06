
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { getMatchAnalysis, getCriteriaExplanation } from '../services/geminiService';
import { supabase } from '../services/supabase';

const MATCHING_CRITERIA = [
  { id: 'content', title: 'Content DNA', icon: <Icons.Analytics />, desc: 'Visual style, color palettes, and editing complexity.', color: 'purple' },
  { id: 'audience', title: 'Audience Quality', icon: <Icons.Dashboard />, desc: 'Bot detection and real-time engagement patterns.', color: 'blue' },
  { id: 'roi', title: 'ROI Prediction', icon: <Icons.Wallet />, desc: 'Cost-per-engagement historical analysis.', color: 'green' },
  { id: 'synergy', title: 'Brand Synergy', icon: <Icons.Robot />, desc: 'Sentiment alignment and semantic brand matching.', color: 'pink' }
];

const MatchingSystem: React.FC = () => {
  const [params, setParams] = useState({ niche: 'Beauty', goal: 'Engagement', budget: '$1000' });
  const [results, setResults] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [criteriaDetail, setCriteriaDetail] = useState<{ title: string, content: string } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const runMatching = async () => {
    setIsMatching(true);
    setResults([]);
    
    // Animate through pipeline steps
    for (let i = 0; i <= 3; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 400));
    }
    
    // Fetch real candidates from Supabase
    const { data: candidates } = await supabase.from('influencers').select('*');
    
    if (candidates) {
      const matchedPromises = candidates.map(async (inf) => {
        let matchScore = inf.ai_score || 80;
        // Simple boost logic
        if (inf.niche.some((n: string) => n.toLowerCase().includes(params.niche.toLowerCase()))) {
          matchScore += 5;
        }
        if (matchScore > 100) matchScore = 100;

        const aiExplanation = await getMatchAnalysis(params, inf);
        return { 
          ...inf, 
          matchScore, 
          aiExplanation,
          img: inf.avatar,
          handle: inf.handle,
          name: inf.name,
          niche: inf.niche[0]
        };
      });

      const finalResults = await Promise.all(matchedPromises);
      setResults(finalResults.sort((a, b) => b.matchScore - a.matchScore));
    }
    
    setIsMatching(false);
  };

  const handleFetchCriteriaDetail = async (title: string) => {
    setIsLoadingDetail(true);
    setCriteriaDetail(null);
    try {
      const explanation = await getCriteriaExplanation(title);
      setCriteriaDetail({ title, content: explanation });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">AI Matching Science</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
          The WeConnect Neural Engine processes database signals to find the perfect creator.
        </p>
      </div>

      {/* Pipeline Visualizer */}
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          {[
            { label: 'DB Query', icon: '🗄️', desc: 'Syncing social profiles' },
            { label: 'Neural Scan', icon: '🧠', desc: 'Vision assessment' },
            { label: 'Gemini NLP', icon: '✨', desc: 'Tone assessment' },
            { label: 'ROI Pred', icon: '📊', desc: 'Final scoring' }
          ].map((step, idx) => (
            <div key={idx} className={`flex flex-col items-center text-center transition-all duration-500 ${isMatching && activeStep >= idx ? 'scale-110 opacity-100' : 'opacity-40 scale-100'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg ${isMatching && activeStep === idx ? 'bg-purple-600 animate-pulse text-white' : 'bg-gray-100'}`}>
                {step.icon}
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{step.label}</h4>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Engine Logic</h3>
            <div className="space-y-4">
              {MATCHING_CRITERIA.map((crit) => (
                <button 
                  key={crit.id}
                  onClick={() => handleFetchCriteriaDetail(crit.title)}
                  className="w-full text-left group flex items-start space-x-4 p-4 rounded-3xl hover:bg-gray-50 transition-all"
                >
                  <div className={`p-2 bg-gray-100 rounded-xl mt-1 group-hover:bg-purple-100 transition-colors`}>
                    {crit.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{crit.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{crit.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {(isLoadingDetail || criteriaDetail) && (
              <div className="mt-8 p-6 bg-gray-900 rounded-3xl text-white relative animate-in slide-in-from-bottom-4">
                <button onClick={() => setCriteriaDetail(null)} className="absolute top-4 right-4 opacity-50"><Icons.Close /></button>
                {isLoadingDetail ? <div className="animate-pulse">Consulting AI...</div> : (
                  <>
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">{criteriaDetail?.title} Logic</h4>
                    <p className="text-sm leading-relaxed text-gray-300 italic">{criteriaDetail?.content}</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-purple-600 p-8 rounded-[40px] text-white space-y-6">
            <h3 className="text-xl font-bold">Simulator</h3>
            <div className="space-y-4">
              <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none" onChange={(e) => setParams(p => ({ ...p, niche: e.target.value }))}>
                <option className="text-black">Beauty</option>
                <option className="text-black">Tech</option>
                <option className="text-black">Travel</option>
              </select>
              <button 
                onClick={runMatching}
                disabled={isMatching}
                className="w-full bg-white text-purple-700 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
              >
                {isMatching ? <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent animate-spin rounded-full"></div> : <span>Run Match Engine</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {results.length > 0 ? (
            <div className="space-y-6 animate-in fade-in">
              {results.map((res, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start space-x-0 md:space-x-8">
                  <div className="relative mb-4 md:mb-0">
                    <img src={res.img} className="w-24 h-24 rounded-[32px] object-cover shadow-xl" alt="" />
                    <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-black w-10 h-10 flex items-center justify-center rounded-2xl">
                      {res.matchScore}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xl text-gray-900">{res.name}</h4>
                    <p className="text-xs text-gray-400 mb-4">{res.handle} • {res.niche}</p>
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <h5 className="text-[10px] font-black uppercase text-purple-400 mb-2">Gemini Match Report</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">{res.aiExplanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-white rounded-[40px] border border-gray-100 flex flex-col items-center justify-center p-12 text-center opacity-30">
              <Icons.Robot />
              <p className="mt-4 font-bold">Engine Idle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingSystem;
