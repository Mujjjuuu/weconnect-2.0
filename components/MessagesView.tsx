
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message, Influencer, NeuralAgent } from '../types';
import { Icons, NEURAL_AGENTS } from '../constants';
import { chatWithAi } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface MessagesViewProps {
  user: UserProfile;
  initialPartner?: Influencer | NeuralAgent | null;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user, initialPartner }) => {
  const [activePartner, setActivePartner] = useState<Influencer | NeuralAgent | null>(initialPartner || NEURAL_AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<(Influencer | NeuralAgent)[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available chat partners
  useEffect(() => {
    const loadPartners = async () => {
      const agents = NEURAL_AGENTS;
      let influencers: Influencer[] = [];
      
      if (isSupabaseConfigured()) {
        const { data } = await supabase.from('influencers').select('*');
        if (data) influencers = data;
      }
      
      setConversations([...agents, ...influencers]);
    };
    loadPartners();
  }, []);

  // Initialize chat when partner changes
  useEffect(() => {
    if (activePartner) {
      const greeting = (activePartner as any).greeting || "Hello! How can I help you today?";
      setMessages([
        { id: 'initial', senderId: activePartner.id, receiverId: user.id, text: greeting, timestamp: new Date().toLocaleTimeString(), isAi: true }
      ]);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePartner?.id, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activePartner) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      senderId: user.id, 
      receiverId: activePartner.id, 
      text: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const instruction = (activePartner as any).systemInstruction || "You are a professional contact on WeConnect.";
      const response = await chatWithAi(input, instruction);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        senderId: activePartner.id, 
        receiverId: user.id, 
        text: response, 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: Message = { 
        id: (Date.now() + 2).toString(), 
        senderId: activePartner.id, 
        receiverId: user.id, 
        text: "I'm having a slight connection issue. Please try again!", 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Neural Comm Center</h2>
        <p className="text-gray-500 mt-2 font-medium text-lg">Secure, AI-augmented negotiations with verified creators and agents.</p>
      </div>

      <div className="bg-white rounded-[64px] border border-gray-100 shadow-3xl overflow-hidden flex h-[750px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-50 bg-gray-50/30 flex flex-col">
           <div className="p-8 border-b border-gray-100 bg-white">
              <div className="relative">
                 <input 
                   placeholder="Search Encounters..." 
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-200 text-[11px] font-black uppercase tracking-widest text-gray-900" 
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
              <p className="px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Neural Gateways</p>
              {conversations.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setActivePartner(p)}
                  className={`w-full p-4 rounded-3xl flex items-center space-x-4 transition-all group ${activePartner?.id === p.id ? 'bg-white shadow-xl border border-gray-50' : 'hover:bg-white/50'}`}
                >
                   <div className="relative shrink-0">
                      <img src={(p as any).avatar || (p as any).avatarUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   <div className="text-left overflow-hidden">
                      <p className="font-black text-gray-900 leading-tight truncate">{(p as any).name || (p as any).fullName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{(p as any).role || (p as any).handle || 'Creator'}</p>
                   </div>
                </button>
              ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
             <div className="flex items-center space-x-5">
                <img src={(activePartner as any)?.avatar || (activePartner as any)?.avatarUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                <div>
                   <h3 className="text-xl font-black text-gray-900 tracking-tight">{(activePartner as any)?.name || (activePartner as any)?.fullName}</h3>
                   <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Connection Active</span>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                   </div>
                </div>
             </div>
             <div className="flex space-x-2">
                <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"><Icons.Settings /></button>
                <button className="p-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-100 active:scale-95"><Icons.Campaigns /></button>
             </div>
          </div>

          {/* Messages Window */}
          <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-gray-50/20">
             {messages.map(m => (
               <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm ${
                    m.senderId === user.id 
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-50' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
                  }`}>
                     {m.text}
                     <div className={`flex items-center space-x-2 mt-3 ${m.senderId === user.id ? 'justify-end text-white/50' : 'justify-start text-gray-300'}`}>
                        <span className="text-[8px] font-black uppercase tracking-widest">{m.timestamp}</span>
                        {m.senderId === user.id && <span className="text-[10px]">✓✓</span>}
                     </div>
                  </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex space-x-2 items-center">
                     <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                     <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300"></div>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-10 border-t border-gray-50">
             <div className="relative group">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Transmit message to neural network..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-10 py-6 outline-none focus:ring-4 focus:ring-purple-50 focus:bg-white font-bold text-gray-900 shadow-inner transition-all" 
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-4 top-4 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-20"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
