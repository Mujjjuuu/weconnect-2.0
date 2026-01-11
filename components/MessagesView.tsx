
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message, Influencer, NeuralAgent, ChatPartner } from '../types';
import { Icons, NEURAL_AGENTS } from '../constants';
import { chatWithAi } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface MessagesViewProps {
  user: UserProfile;
  initialPartner?: ChatPartner | null;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user, initialPartner }) => {
  // conversations stores the list of people the user has interacted with
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  
  // chatHistories maps partner ID to their specific message array
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Merge Neural Agents and any saved local encounters
  useEffect(() => {
    const loadInitialState = () => {
      const savedEncounters = localStorage.getItem(`encounters_${user.id}`);
      const savedHistories = localStorage.getItem(`histories_${user.id}`);
      
      let basePartners: ChatPartner[] = [...NEURAL_AGENTS];
      let baseHistories: Record<string, Message[]> = {};

      if (savedEncounters) {
        try {
          const parsed = JSON.parse(savedEncounters);
          // Only add encounters not already in NEURAL_AGENTS
          const filtered = parsed.filter((p: ChatPartner) => !NEURAL_AGENTS.find(na => na.id === p.id));
          basePartners = [...basePartners, ...filtered];
        } catch (e) { console.error("Error loading encounters", e); }
      }

      if (savedHistories) {
        try {
          baseHistories = JSON.parse(savedHistories);
        } catch (e) { console.error("Error loading histories", e); }
      }

      setConversations(basePartners);
      setChatHistories(baseHistories);
      
      // Set initial active partner
      if (initialPartner) {
        setActivePartner(initialPartner);
      } else if (basePartners.length > 0) {
        setActivePartner(basePartners[0]);
      }
    };

    loadInitialState();
  }, [user.id]);

  // 2. Handle new partner initiation from external props (e.g. Marketplace click)
  useEffect(() => {
    if (initialPartner) {
      setConversations(prev => {
        if (!prev.find(p => p.id === initialPartner.id)) {
          const updated = [initialPartner, ...prev];
          localStorage.setItem(`encounters_${user.id}`, JSON.stringify(updated.filter(p => !NEURAL_AGENTS.find(na => na.id === p.id))));
          return updated;
        }
        return prev;
      });
      setActivePartner(initialPartner);
    }
  }, [initialPartner, user.id]);

  // 3. Auto-initialize greeting if history is empty
  useEffect(() => {
    if (activePartner && !chatHistories[activePartner.id]) {
      const greetingMsg: Message = {
        id: `greet_${activePartner.id}`,
        senderId: activePartner.id,
        receiverId: user.id,
        text: activePartner.greeting || "Hello! Ready to discuss a collaboration?",
        timestamp: new Date().toLocaleTimeString(),
        isAi: true
      };
      setChatHistories(prev => ({
        ...prev,
        [activePartner.id]: [greetingMsg]
      }));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePartner, user.id]);

  // 4. Persistence Effect
  useEffect(() => {
    if (Object.keys(chatHistories).length > 0) {
      localStorage.setItem(`histories_${user.id}`, JSON.stringify(chatHistories));
    }
  }, [chatHistories, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePartner ? chatHistories[activePartner.id] : null]);

  const handleSend = async () => {
    if (!input.trim() || !activePartner) return;

    const partnerId = activePartner.id;
    const userMsg: Message = { 
      id: Date.now().toString(), 
      senderId: user.id, 
      receiverId: partnerId, 
      text: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setChatHistories(prev => ({
      ...prev,
      [partnerId]: [...(prev[partnerId] || []), userMsg]
    }));
    
    setInput('');
    setIsLoading(true);

    try {
      // Create detailed context for the AI to embody the character
      const partnerContext = `
        Your name is ${activePartner.name}. 
        Your role is ${activePartner.role || 'Content Creator'}.
        ${(activePartner as any).niche ? `Your niches are: ${(activePartner as any).niche.join(', ')}.` : ''}
        ${(activePartner as any).bio ? `Your bio says: ${(activePartner as any).bio}` : ''}
        Instruction: ${activePartner.systemInstruction || "Be professional and helpful."}
        Embody this character exactly in your response. Respond from your perspective as this individual.
      `;

      const response = await chatWithAi(input, partnerContext);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        senderId: partnerId, 
        receiverId: user.id, 
        text: response, 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      
      setChatHistories(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), aiMsg]
      }));
    } catch (e) {
      const errorMsg: Message = { 
        id: (Date.now() + 2).toString(), 
        senderId: partnerId, 
        receiverId: user.id, 
        text: "I'm having a connectivity issue. Please try again!", 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      setChatHistories(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = activePartner ? (chatHistories[activePartner.id] || []) : [];

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
                      <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   <div className="text-left overflow-hidden">
                      <p className="font-black text-gray-900 leading-tight truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{p.role || (p as any).handle || 'Creator'}</p>
                   </div>
                </button>
              ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activePartner ? (
            <>
              {/* Header */}
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                    <img src={activePartner.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{activePartner.name}</h3>
                      <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Connection Active</span>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                  {(activePartner as any).niche && (
                    <div className="hidden xl:flex space-x-2">
                      {(activePartner as any).niche.slice(0, 2).map((n: string) => (
                        <span key={n} className="px-3 py-1 bg-purple-50 text-purple-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-purple-100">{n}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-400"><Icons.Settings /></button>
                    <button className="p-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-100 active:scale-95"><Icons.Campaigns /></button>
                  </div>
                </div>
              </div>

              {/* Messages Window */}
              <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-gray-50/20">
                {currentMessages.map(m => (
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
                      placeholder={`Transmit message to ${activePartner.name}...`} 
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
               <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mb-8 shadow-inner">
                  <Icons.Messages />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">Select a Gateway</h3>
               <p className="text-gray-400 font-medium max-w-xs">Choose a verified creator or neural agent to initiate a secure encrypted session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
