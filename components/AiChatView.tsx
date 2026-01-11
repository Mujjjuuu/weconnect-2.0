
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message, NeuralAgent, ChatPartner } from '../types';
import { Icons, NEURAL_AGENTS } from '../constants';
import { chatWithAi } from '../services/geminiService';
import VoiceDictationButton from './VoiceDictationButton';

interface AiChatViewProps {
  user: UserProfile;
}

const AiChatView: React.FC<AiChatViewProps> = ({ user }) => {
  const [activeAgent, setActiveAgent] = useState<NeuralAgent>(NEURAL_AGENTS[0]);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`agent_chats_${user.id}`);
    if (saved) {
      try {
        setChatHistories(JSON.parse(saved));
      } catch (e) { console.error("Failed to load agent chats", e); }
    }
  }, [user.id]);

  useEffect(() => {
    if (Object.keys(chatHistories).length > 0) {
      localStorage.setItem(`agent_chats_${user.id}`, JSON.stringify(chatHistories));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, user.id]);

  useEffect(() => {
    if (activeAgent && !chatHistories[activeAgent.id]) {
      const greetingMsg: Message = {
        id: `greet_${activeAgent.id}`,
        senderId: activeAgent.id,
        receiverId: user.id,
        text: activeAgent.greeting,
        timestamp: new Date().toLocaleTimeString(),
        isAi: true
      };
      setChatHistories(prev => ({ ...prev, [activeAgent.id]: [greetingMsg] }));
    }
  }, [activeAgent, user.id]);

  const handleSend = async () => {
    if (!input.trim() || !activeAgent) return;

    const agentId = activeAgent.id;
    const userMsg: Message = { 
      id: Date.now().toString(), 
      senderId: user.id, 
      receiverId: agentId, 
      text: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setChatHistories(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMsg]
    }));
    
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAi(input, activeAgent.systemInstruction);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        senderId: agentId, 
        receiverId: user.id, 
        text: response, 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      
      setChatHistories(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), aiMsg]
      }));
    } catch (e) {
      const errorMsg: Message = { 
        id: (Date.now() + 2).toString(), 
        senderId: agentId, 
        receiverId: user.id, 
        text: "Neural link timeout. Reconnecting...", 
        timestamp: new Date().toLocaleTimeString(), 
        isAi: true 
      };
      setChatHistories(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), errorMsg] }));
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = chatHistories[activeAgent.id] || [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">AI Neural Suite</h2>
        <p className="text-gray-500 mt-2 font-medium text-lg">Direct access to the WeConnect neural engine agents.</p>
      </div>

      <div className="bg-white rounded-[64px] border border-gray-100 shadow-3xl overflow-hidden flex h-[750px]">
        {/* Agents Selection */}
        <div className="w-80 border-r border-gray-50 bg-gray-50/30 flex flex-col">
           <div className="p-8 border-b border-gray-100 bg-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Neural Modality</p>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {NEURAL_AGENTS.map((agent) => (
                <button 
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
                  className={`w-full p-6 rounded-[32px] flex items-center space-x-4 transition-all group ${activeAgent?.id === agent.id ? 'bg-white shadow-xl border border-gray-100' : 'hover:bg-white/50'}`}
                >
                   <div className={`w-12 h-12 rounded-2xl ${agent.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                      <Icons.Robot />
                   </div>
                   <div className="text-left">
                      <p className="font-black text-gray-900 leading-tight">{agent.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{agent.role}</p>
                   </div>
                </button>
              ))}
           </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-2xl ${activeAgent.color} flex items-center justify-center text-white shadow-xl`}>
                   <Icons.Robot />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{activeAgent.name}</h3>
                  <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">{activeAgent.specialty}</p>
                </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-gray-50/20 no-scrollbar">
            {currentMessages.map(m => (
              <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm ${
                    m.senderId === user.id 
                      ? 'bg-gray-900 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
                  }`}>
                    {m.text}
                    <div className="flex items-center space-x-2 mt-3 opacity-30">
                        <span className="text-[8px] font-black uppercase tracking-widest">{m.timestamp}</span>
                    </div>
                  </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-white p-6 rounded-[32px] border border-gray-50 flex space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300"></div>
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
                    placeholder={`Consult ${activeAgent.name}...`} 
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
                className="p-5 bg-purple-600 text-white rounded-2xl shadow-xl hover:bg-purple-700 active:scale-95 disabled:opacity-20 shrink-0"
                disabled={isLoading || !input.trim()}
              >
                <Icons.ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatView;
