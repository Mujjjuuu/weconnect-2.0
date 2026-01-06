
import React, { useState } from 'react';
import { analyzeContent } from '../services/geminiService';
import { AIAnalysisResult } from '../types';
import { Icons } from '../constants';

const AIAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const base64 = preview.split(',')[1];
      const data = await analyzeContent(base64);
      setResult(data);
    } catch (error) {
      alert("Failed to analyze image. Ensure your API key is correct.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
          <Icons.Analytics />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Content Quality Analyzer</h2>
          <p className="text-sm text-gray-500">Upload a video frame or UGC photo for instant AI scoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className={`relative aspect-video rounded-3xl border-2 border-dashed ${preview ? 'border-purple-200' : 'border-gray-200'} bg-gray-50 flex flex-col items-center justify-center overflow-hidden`}>
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, up to 10MB</p>
              </div>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!preview || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
              !preview || isAnalyzing ? 'bg-gray-100 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>AI is thinking...</span>
              </>
            ) : (
              <>
                <Icons.Robot />
                <span>Start AI Analysis</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {result ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Creativity', val: result.creativityScore, color: 'text-purple-600' },
                  { label: 'Engagement', val: result.engagementPotential, color: 'text-blue-600' },
                  { label: 'Friendliness', val: result.brandFriendliness, color: 'text-pink-600' }
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}%</p>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-purple-900 mb-2">AI Summary</h3>
                <p className="text-sm text-purple-800 leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                      <div className="mt-1 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icons.Analytics />
              </div>
              <p className="text-gray-500 max-w-xs">Upload an image and run analysis to see AI insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyzer;
