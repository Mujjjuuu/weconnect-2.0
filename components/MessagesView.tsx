
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message, Influencer, ChatPartner } from '../types';
import { Icons } from '../constants';
import { chatWithAi } from '../services/geminiService';
import VoiceDictationButton from './VoiceDictationButton';

interface MessagesViewProps {
  user: UserProfile;
  initialPartner?: ChatPartner | null;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user, initialPartner }) => {
  const [conversations, setConversations] = useState<ChatPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load persisted human influencer chats
  useEffect(() => {
    const savedEncounters = localStorage.getItem(`human_encounters_${user.id}`);
    const savedHistories = localStorage.getItem(`human_histories_${user.id}`);
    
    if (savedEncounters) {
      try { setConversations(JSON.parse(savedEncounters)); } catch (e) {}
    }
    if (savedHistories) {
      try { setChatHistories(JSON.parse(savedHistories)); } catch (e) {}
    }
  }, [user.id]);

  // 2. Add new human influencer to conversation list
  useEffect(() => {
    if (initialPartner && initialPartner.id) {
      setConversations(prev => {
        if (!prev.find(p => p.id === initialPartner.id)) {
          const updated = [initialPartner, ...prev];
          localStorage.setItem(`human_encounters_${user.id}`, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
      setActivePartner(initialPartner);
    }
  }, [initialPartner, user.id]);

  useEffect(() => {
    if (Object.keys(chatHistories).length > 0) {
      localStorage.setItem(`human_histories_${user.id}`, JSON.stringify(chatHistories));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, user.id]);

  // 3. Initialize greeting
  useEffect(() => {
    if (activePartner && !chatHistories[activePartner.id]) {
      const greetingMsg: Message = {
        id: `greet_${activePartner.id}`,
        senderId: activePartner.id,
        receiverId: user.id,
        text: activePartner.greeting || "Hello! Ready to collaborate?",
        timestamp: new Date().toLocaleTimeString(),
        isAi: true
      };
      setChatHistories(prev => ({ ...prev, [activePartner.id]: [greetingMsg] }));
    }
  }, [activePartner, user.id]);

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
      const partnerContext = `
        Your name is ${activePartner.name}. 
        Your role is ${activePartner.role || 'Content Creator'}.
        ${(activePartner as any).niche ? `Your niches are: ${(activePartner as any).niche.join(', ')}.` : ''}
        ${(activePartner as any).bio ? `Your bio says: ${(activePartner as any).bio}` : ''}
        Instruction: ${activePartner.systemInstruction || "Be professional and helpful."}
        Respond strictly as this person. Embody their personality.
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
        text: "Neural comm failure. Retry suggested.", 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      setChatHistories(prev => ({ ...prev, [partnerId]: [...(prev[partnerId] || []), errorMsg] }));
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = activePartner ? (chatHistories[activePartner.id] || []) : [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Verified Communications</h2>
        <p className="text-gray-500 mt-2 font-medium text-lg">Direct, AI-embodied negotiations with elite creators.</p>
      </div>

      <div className="bg-white rounded-[64px] border border-gray-100 shadow-3xl overflow-hidden flex h-[750px]">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-gray-50 bg-gray-50/30 flex flex-col">
           <div className="p-8 border-b border-gray-100 bg-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Negotiations</p>
           </div>
           <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
              {conversations.length > 0 ? conversations.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setActivePartner(p)}
                  className={`w-full p-4 rounded-3xl flex items-center space-x-4 transition-all ${activePartner?.id === p.id ? 'bg-white shadow-xl border border-gray-100' : 'hover:bg-white/50'}`}
                >
                   <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                   <div className="text-left overflow-hidden">
                      <p className="font-black text-gray-900 leading-tight truncate">{p.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">{(p as any).handle || 'Negotiation Active'}</p>
                   </div>
                </button>
              )) : (
                <div className="py-20 text-center px-6">
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No active deals. Visit the Marketplace.</p>
                </div>
              )}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activePartner ? (
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-50">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                      <img src={activePartner.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{activePartner.name}</h3>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center space-x-2">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                           <span>Identity Vetted</span>
                        </p>
                      </div>
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-gray-50/10 no-scrollbar">
                  {currentMessages.map(m => (
                    <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm ${
                          m.senderId === user.id 
                            ? 'bg-purple-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                          {m.text}
                          <p className="text-[8px] mt-2 opacity-50 font-black uppercase tracking-widest">{m.timestamp}</p>
                        </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex space-x-2">
                          <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-10 border-t border-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1 group">
                        <input 
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSend()}
                          placeholder={`Message ${activePartner.name}...`} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-[32px] pl-10 pr-16 py-6 outline-none focus:ring-4 focus:ring-purple-50 font-bold text-gray-900 shadow-inner" 
                        />
                        <div className="absolute right-4 top-4">
                           <VoiceDictationButton 
                            onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                            className="bg-transparent text-gray-300 hover:text-purple-600 shadow-none scale-110"
                            color="bg-transparent"
                           />
                        </div>
                    </div>
                    <button 
                      onClick={handleSend}
                      className="p-5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-20 shrink-0"
                      disabled={isLoading || !input.trim()}
                    >
                      <Icons.ChevronRight />
                    </button>
                  </div>
                </div>
              </div>

              {/* Character Profile Sidebar */}
              <div className="w-72 p-8 bg-gray-50/20 space-y-8 overflow-y-auto no-scrollbar hidden xl:block">
                 <div className="text-center">
                    <img src={activePartner.avatar} className="w-32 h-32 rounded-[40px] mx-auto object-cover shadow-2xl mb-6" alt="" />
                    <h4 className="font-black text-xl text-gray-900 tracking-tighter">{activePartner.name}</h4>
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-1">{activePartner.role}</p>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Creator Profile</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{(activePartner as any).bio || "Elite creator on WeConnect ecosystem."}</p>
                 </div>
                 {(activePartner as any).niche && (
                   <div className="space-y-3">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Specialized Niche</p>
                      <div className="flex flex-wrap gap-2">
                         {(activePartner as any).niche.map((n: string) => (
                           <span key={n} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[8px] font-black uppercase text-gray-500">{n}</span>
                         ))}
                      </div>
                   </div>
                 )}
                 <div className="pt-8 border-t border-gray-100">
                    <button className="w-full py-4 bg-white border border-gray-100 rounded-2xl font-black text-[9px] uppercase tracking-widest text-gray-900 hover:border-purple-200 transition-all shadow-sm">View Portfolio</button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
               <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mb-8 shadow-inner">
                  <Icons.Messages />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">Initiate Encounter</h3>
               <p className="text-gray-400 font-medium max-w-xs">Start a conversation from the Marketplace to begin neural negotiations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
