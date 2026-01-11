
import React, { useState, useEffect } from 'react';
import { Campaign, AIAnalysisResult } from '../types';
import { Icons } from '../constants';
import { analyzeContent, getPostCampaignInsights, generateCampaignStrategy } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import VoiceDictationButton from './VoiceDictationButton';

interface CampaignManagerProps {
  sharedCampaigns: Campaign[];
  onUpdateCampaigns: (newList: Campaign[]) => void;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ sharedCampaigns, onUpdateCampaigns }) => {
  const [view, setView] = useState<'list' | 'create' | 'review'>('list');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Form State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    deliverables: '',
    platform: 'Instagram'
  });

  // Review State
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ analysis: AIAnalysisResult, insights: string } | null>(null);

  const handleAiAssist = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const strategy = await generateCampaignStrategy(aiPrompt);
      if (strategy) {
        setFormData({
          name: strategy.name || 'AI Generated Campaign',
          budget: strategy.budget || '$5,000',
          deliverables: Array.isArray(strategy.deliverables) ? strategy.deliverables.join(', ') : '2 Reels, 1 Story',
          platform: 'All Platforms'
        });
      }
    } catch (err) {
      console.error("AI Assistant Failed:", err);
      alert("AI draft failed. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.budget) return;

    const newCamp: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      budget: formData.budget,
      deliverables: formData.deliverables.split(',').map(s => s.trim()).filter(s => s !== ''),
      status: 'active',
      progress: 0,
      influencersCount: 0,
      brandName: 'My Brand'
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('campaigns').insert([{
          name: newCamp.name,
          budget: newCamp.budget,
          deliverables: newCamp.deliverables,
          status: newCamp.status,
          progress: newCamp.progress,
          influencers_count: newCamp.influencersCount
        }]);
        if (error) throw error;
      } catch (e) {
        console.error("DB Insert error:", e);
      }
    }
    
    onUpdateCampaigns([newCamp, ...sharedCampaigns]);
    setView('list');
    setFormData({ name: '', budget: '', deliverables: '', platform: 'Instagram' });
    setAiPrompt('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startReview = async () => {
    if (!reviewImage || !selectedCampaign) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const base64 = reviewImage.split(',')[1];
      const analysis = await analyzeContent(base64);
      const insights = await getPostCampaignInsights(selectedCampaign.name, analysis);
      setReviewResult({ analysis, insights });
    } catch (error) {
      console.error("AI Review failed:", error);
      alert("AI Review failed. Check your API key.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Campaign Hub.</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Scale your influence with AI-driven strategy.</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')}
            className="bg-purple-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-purple-700 transition-all flex items-center space-x-3 active:scale-95"
          >
            <Icons.Campaigns />
            <span>Launch New Campaign</span>
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sharedCampaigns.length > 0 ? sharedCampaigns.map(c => (
            <div key={c.id} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-5 rounded-2xl ${c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Icons.Campaigns />
                </div>
                <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  c.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>{c.status === 'completed' ? 'Finished' : 'Live'}</span>
              </div>
              
              <h3 className="text-3xl font-black text-gray-900 mb-2 leading-tight tracking-tight">{c.name}</h3>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-6">Partner: {c.brandName || 'Verified Brand'}</p>
              
              <div className="space-y-4 mb-8 mt-auto">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-300">
                  <span>Progress</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full transition-all duration-1000" style={{width: `${c.progress}%`}}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Budget</p>
                  <p className="font-black text-gray-900 text-xl tracking-tighter">{c.budget}</p>
                </div>
                <button 
                  onClick={() => { setSelectedCampaign(c); setView('review'); }}
                  className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  {c.status === 'completed' ? 'See Review' : 'Manage Hub'}
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-3 py-32 text-center bg-white rounded-[56px] border-2 border-dashed border-gray-100">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-6">
                  <Icons.Campaigns />
               </div>
               <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No Active Campaigns Synchronized</p>
            </div>
          )}
        </div>
      )}

      {view === 'create' && (
        <div className="bg-white rounded-[64px] p-16 shadow-3xl border border-gray-50 max-w-5xl mx-auto relative overflow-hidden animate-in zoom-in duration-500">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Draft New Campaign</h2>
            <button onClick={() => setView('list')} className="p-4 hover:bg-gray-50 rounded-2xl transition-all text-gray-300 hover:text-gray-900 active:scale-90">
              <Icons.Close />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8 bg-gray-50 p-10 rounded-[48px] border border-gray-100 shadow-inner">
               <div className="flex items-center space-x-3 text-purple-600 mb-6 font-black uppercase text-xs">
                 <Icons.Robot />
                 <span>Neural Strategist Assist</span>
               </div>
               <p className="text-gray-600 font-medium">Describe your vision. AI will generate a performance-optimized strategy.</p>
               <div className="relative">
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Example: Promote my new eco-friendly energy drink targeting urban commuters with active lifestyles..."
                    className="w-full p-6 pb-16 bg-white border border-gray-200 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 min-h-[160px] resize-none font-bold text-black shadow-sm"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                     <VoiceDictationButton 
                      onTranscript={(text) => setAiPrompt(prev => prev + (prev ? ' ' : '') + text)}
                      className="bg-gray-100 text-gray-400 hover:text-purple-600 shadow-none border-none scale-90"
                      color="bg-gray-100"
                     />
                  </div>
               </div>
               <button 
                onClick={handleAiAssist}
                disabled={isAiLoading || !aiPrompt}
                className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all flex items-center justify-center space-x-3 active:scale-95"
               >
                {isAiLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <Icons.Robot />}
                <span>{isAiLoading ? 'Synthesizing...' : 'Generate AI Blueprint'}</span>
               </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Campaign Identity</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-black text-lg shadow-inner"
                  placeholder="e.g. Winter Peak Skincare"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Allocated Budget</label>
                  <input 
                    type="text" 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-black shadow-inner"
                    placeholder="$1,000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Network Focus</label>
                  <select 
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-black appearance-none shadow-inner"
                  >
                    <option>Instagram</option>
                    <option>TikTok</option>
                    <option>YouTube</option>
                    <option>All Platforms</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Deliverable Roadmap (comma separated)</label>
                <textarea 
                  value={formData.deliverables}
                  onChange={(e) => setFormData({...formData, deliverables: e.target.value})}
                  className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-black text-black min-h-[120px] resize-none shadow-inner"
                  placeholder="e.g. 2 Reels, 5 Stories, 1 Static Post"
                />
              </div>

              <button 
                onClick={handleCreate}
                disabled={!formData.name || !formData.budget}
                className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-30"
              >
                Sync and Initialize Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'review' && selectedCampaign && (
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <button 
            onClick={() => { setView('list'); setReviewResult(null); setReviewImage(null); }}
            className="flex items-center space-x-3 text-gray-400 hover:text-purple-600 font-black text-xs uppercase tracking-widest mb-12 transition-colors active:scale-95"
          >
            <Icons.ChevronLeft />
            <span>Return to Fleet</span>
          </button>

          <div className="bg-white rounded-[64px] p-16 shadow-3xl border border-gray-50 flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2 space-y-10">
               <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Diagnostic Review</h2>
               <p className="text-gray-500 font-medium text-lg">AI-Auditing Assets for <span className="text-purple-600">"{selectedCampaign.name}"</span></p>
               
               <div className={`relative aspect-video rounded-[40px] border-4 border-dashed transition-all group overflow-hidden ${
                 reviewImage ? 'border-purple-200 shadow-xl shadow-purple-50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
               }`}>
                  {reviewImage ? (
                    <img src={reviewImage} alt="Audit Media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6 text-purple-600">
                        <Icons.Analytics />
                      </div>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Provide Diagnostic Image</p>
                      <p className="text-xs text-gray-400 font-medium mt-2">Upload a frame or creative to initiate neural scoring.</p>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
               </div>

               <button 
                onClick={startReview}
                disabled={!reviewImage || isReviewing}
                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-4 transition-all ${
                  !reviewImage || isReviewing ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-2xl active:scale-95'
                }`}
               >
                {isReviewing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Robot />}
                <span>{isReviewing ? 'Analyzing Neural Patterns...' : 'Execute Performance Audit'}</span>
               </button>
            </div>

            <div className="lg:w-1/2">
              {reviewResult ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-12 duration-1000">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm text-center">
                      <p className="text-4xl font-black text-purple-600 mb-2">{reviewResult.analysis.creativityScore}%</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Creativity</p>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
                      <p className="text-4xl font-black text-blue-600 mb-2">{reviewResult.analysis.engagementPotential}%</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Viral Potential</p>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm text-center">
                      <p className="text-4xl font-black text-green-600 mb-2">{reviewResult.analysis.brandFriendliness}%</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Brand Safety</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-[48px] p-12 text-white shadow-2xl">
                    <h3 className="text-2xl font-black mb-8 text-purple-400">Strategic Pivot Insights</h3>
                    <div className="prose prose-sm prose-invert leading-loose text-gray-300 whitespace-pre-line font-medium text-lg italic">
                      "{reviewResult.insights}"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-gray-50/20 rounded-[64px] border-2 border-dashed border-gray-100">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-gray-200 mb-8 shadow-inner">
                    <Icons.Robot />
                  </div>
                  <h4 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Awaiting Media Feed</h4>
                  <p className="text-sm text-gray-400 max-w-sm leading-loose font-medium">Upload a campaign asset to unlock deep-learning performance metrics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
