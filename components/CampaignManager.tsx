
import React, { useState } from 'react';
import { Campaign, AIAnalysisResult } from '../types';
import { Icons } from '../constants';
import { analyzeContent, getPostCampaignInsights } from '../services/geminiService';

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Summer Launch', status: 'active', budget: '$2,500', progress: 60, deliverables: ['1x Reel', '2x Stories'], influencersCount: 4 },
  { id: '2', name: 'Valentine\'s Promo', status: 'completed', budget: '$1,200', progress: 100, deliverables: ['1x TikTok'], influencersCount: 2 },
  { id: '3', name: 'Eco-Friendly Line', status: 'draft', budget: '$5,000', progress: 10, deliverables: ['3x UGC Videos'], influencersCount: 0 },
  { id: '4', name: 'Winter Essentials', status: 'completed', budget: '$3,800', progress: 100, deliverables: ['2x Reels'], influencersCount: 3 },
];

const CampaignManager: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ analysis: AIAnalysisResult, insights: string } | null>(null);

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
      alert("AI Review failed. Check your API key.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Campaign Manager</h1>
          <p className="text-gray-500">Track performance and review content quality.</p>
        </div>
      </div>

      {!selectedCampaign ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CAMPAIGNS.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-purple-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Icons.Campaigns />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  c.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>{c.status}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{c.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{c.deliverables.join(' • ')}</p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Budget</p>
                  <p className="font-bold text-gray-900">{c.budget}</p>
                </div>
                {c.status === 'completed' ? (
                  <button 
                    onClick={() => setSelectedCampaign(c)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors"
                  >
                    Generate Post-Mortem
                  </button>
                ) : (
                  <button className="text-purple-600 text-xs font-bold hover:underline">View Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => { setSelectedCampaign(null); setReviewResult(null); setReviewImage(null); }}
            className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 font-bold text-sm mb-6"
          >
            <Icons.Close />
            <span>Back to Campaigns</span>
          </button>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/2 space-y-6">
                <h2 className="text-2xl font-black text-gray-900">Reviewing: {selectedCampaign.name}</h2>
                <p className="text-gray-500">Upload a key piece of content from this campaign. Our AI will assess its success and provide strategic advice for your future growth.</p>
                
                <div className={`relative aspect-video rounded-[32px] border-2 border-dashed ${reviewImage ? 'border-purple-200' : 'border-gray-200'} bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-all`}>
                  {reviewImage ? (
                    <img src={reviewImage} alt="Review" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-8">
                      <Icons.Analytics />
                      <p className="mt-4 text-sm font-bold text-gray-600">Drop campaign content here</p>
                      <p className="text-xs text-gray-400 mt-1">Upload the top performing video frame</p>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                </div>

                <button 
                  onClick={startReview}
                  disabled={!reviewImage || isReviewing}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
                    !reviewImage || isReviewing ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xl'
                  }`}
                >
                  {isReviewing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing Success Metrics...</span>
                    </div>
                  ) : (
                    <>
                      <Icons.Robot />
                      <span>Generate AI Success Analysis</span>
                    </>
                  )}
                </button>
              </div>

              <div className="lg:w-1/2">
                {reviewResult ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                        <p className="text-2xl font-black text-purple-600">{reviewResult.analysis.creativityScore}%</p>
                        <p className="text-[10px] text-purple-400 font-bold uppercase">Creativity</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                        <p className="text-2xl font-black text-blue-600">{reviewResult.analysis.engagementPotential}%</p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">Engagement</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                        <p className="text-2xl font-black text-green-600">{reviewResult.analysis.brandFriendliness}%</p>
                        <p className="text-[10px] text-green-400 font-bold uppercase">ROI Likelihood</p>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Icons.Robot />
                      </div>
                      <h3 className="text-lg font-bold mb-4 text-purple-300">AI Post-Mortem Insights</h3>
                      <div className="prose prose-sm prose-invert leading-relaxed text-gray-300 whitespace-pre-line">
                        {reviewResult.insights}
                      </div>
                    </div>

                    <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">Content Performance Summary</h4>
                      <p className="text-sm text-purple-800 opacity-80 italic">"{reviewResult.analysis.summary}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-[40px] opacity-40">
                    <Icons.Robot />
                    <p className="mt-4 font-bold text-gray-500">Strategic Insights Preview</p>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs">AI will calculate ROI potential and suggest pivots once content is analyzed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
