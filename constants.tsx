
import React from 'react';
import { NeuralAgent } from './types';

export const COLORS = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  accent: '#10B981',
};

export const NEURAL_AGENTS: NeuralAgent[] = [
  {
    id: 'aura',
    name: 'Aura',
    role: 'Strategist',
    specialty: 'Campaign ROI',
    color: 'bg-purple-600',
    avatar: 'https://ui-avatars.com/api/?name=Aura&background=7C3AED&color=fff',
    greeting: "Hello, I'm Aura. I specialize in high-level campaign strategy and ROI optimization. How can I scale your vision today?",
    systemInstruction: "You are Aura, the Strategic Lead bot. You focus on data-driven marketing, budget allocation, and long-term brand growth. Be professional and highly analytical."
  },
  {
    id: 'vortex',
    name: 'Vortex',
    role: 'Trend Specialist',
    specialty: 'Virality & Hooks',
    color: 'bg-pink-600',
    avatar: 'https://ui-avatars.com/api/?name=Vortex&background=EC4899&color=fff',
    greeting: "Hey! I'm Vortex. I live in the feed. I'm here to ensure your content hits the algorithm perfectly. Ready to go viral?",
    systemInstruction: "You are Vortex, the Viral Content bot. You know the latest TikTok and Instagram trends. Your tone is energetic, Gen-Z oriented, and focused on engagement hooks."
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'Compliance',
    specialty: 'Brand Safety',
    color: 'bg-indigo-600',
    avatar: 'https://ui-avatars.com/api/?name=Nova&background=4F46E5&color=fff',
    greeting: "Greetings, I'm Nova. I audit content for brand safety and legal compliance. Let's ensure your campaign is flawless.",
    systemInstruction: "You are Nova, the Brand Safety bot. You are precise, cautious, and detail-oriented. You check for FTC compliance and brand alignment."
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Matchmaker',
    specialty: 'Influencer Sourcing',
    color: 'bg-teal-600',
    avatar: 'https://ui-avatars.com/api/?name=Echo&background=0D9488&color=fff',
    greeting: "Hi, I'm Echo. My neural network is dedicated to finding the exact creator for your brand DNA. Who are we looking for?",
    systemInstruction: "You are Echo, the Discovery bot. You are friendly, helpful, and specialized in audience overlap and influencer niches."
  },
  {
    id: 'pulse',
    name: 'Pulse',
    role: 'Analytics',
    specialty: 'Real-time Metrics',
    color: 'bg-amber-600',
    avatar: 'https://ui-avatars.com/api/?name=Pulse&background=D97706&color=fff',
    greeting: "Pulse here. I track the live heartbeat of your campaigns. Ready for a performance deep-dive?",
    systemInstruction: "You are Pulse, the Analytics bot. You love numbers and live tracking. You provide real-time updates on clicks, reach, and sentiment."
  }
];

export const BrandLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ className = "", size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  return (
    <div className={`${sizes[size]} ${className} flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        <path d="M25 45C25 45 20 55 20 65C20 75 25 80 30 80C35 80 40 75 45 60C48 51 50 45 50 45" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" />
        <path d="M75 45C75 45 80 55 80 65C80 75 75 80 70 80C65 80 60 75 55 60C52 51 50 45 50 45" stroke="#A855F7" strokeWidth="12" strokeLinecap="round" />
        <path d="M40 55C45 45 55 45 60 55" stroke="#1E40AF" strokeWidth="10" strokeLinecap="round" style={{ opacity: 0.8 }} />
        <circle cx="25" cy="25" r="8" fill="#7DD3FC" />
        <circle cx="75" cy="25" r="8" fill="#C084FC" />
      </svg>
    </div>
  );
};

export const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  ),
  Campaigns: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  ),
  Discover: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  ),
  Messages: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
  ),
  Analytics: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ),
  Wallet: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  ),
  Robot: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ),
  Mic: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" /></svg>
  ),
  MicOff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-1.201 3.903M17.88 17.88A7 7 0 015 12v-1m12 0V4a3 3 0 00-5.945-0.555M8 5.445V11a3 3 0 005.106 2.106M3 3l18 18M12 19v4M8 23h8" /></svg>
  ),
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
      <path fill="#34A853" d="M16.04 18.013c-1.09.693-2.475 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067C3.186 21.352 7.258 24 12 24c3.11 0 5.918-1.033 8.11-2.858l-4.07-3.129z"/>
      <path fill="#4285F4" d="M23.49 12.275c0-.868-.079-1.706-.221-2.52H12v4.77h6.442a5.504 5.504 0 0 1-2.39 3.61l4.068 3.128c2.383-2.197 3.755-5.432 3.755-8.988z"/>
      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
    </svg>
  ),
  Brand: () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  ),
  Influencer: () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  )
};
