
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Icons, NEURAL_AGENTS, BrandLogo } from '../constants';
import { chatWithAi } from '../services/geminiService';
import { Message, ChatPartner } from '../types';
import VoiceDictationButton from './VoiceDictationButton';

export interface AIChatbotRef {
  openWithPartner: (partner: ChatPartner) => void;
}

const AIChatbot = forwardRef<AIChatbotRef, {}>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<ChatPartner>(NEURAL_AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    openWithPartner: (partner: ChatPartner) => {
      setActivePartner(partner);
      // Logic for embody character: set up a specialized initial state if not chatting before
      setMessages([
        { id: Date.now().toString(), senderId: partner.id, receiverId: 'user', text: partner.greeting || "Hello!", timestamp: new Date().toLocaleTimeString(), isAi: true }
      ]);
      setIsOpen(true);
    }
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), senderId: 'user', receiverId: activePartner.id, text: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Enrich prompt with personality context
      const personalityContext = `
        Your name is ${activePartner.name}.
        Your domain expertise: ${activePartner.role || 'Digital Presence'}.
        Character Bio: ${(activePartner as any).bio || 'A professional on WeConnect.'}
        ${(activePartner as any).niche ? `You operate in these niches: ${(activePartner as any).niche.join(', ')}.` : ''}
        Instruction: ${activePartner.systemInstruction}
        IMPORTANT: Respond as the person described above. Embody their personality, style, and professional context.
      `;

      const response = await chatWithAi(input, personalityContext);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), senderId: activePartner.id, receiverId: 'user', text: response, timestamp: new Date().toLocaleTimeString(), isAi: true };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), senderId: activePartner.id, receiverId: 'user', text: "Apologies, my neural link is flickering. One moment!", timestamp: new Date().toLocaleTimeString(), isAi: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const partnerColor = activePartner.color || 'bg-gray-900';

  return (
    <div className="fixed bottom-10 right-10 z-[1000]">
      {isOpen ? (
        <div className="w-[380px] h-[600px] bg-white rounded-[40px] shadow-[0_32px_128px_-16px_rgba(124,58,237,0.3)] flex flex-col border border-purple-50 animate-in fade-in slide-in-from-bottom-12 duration-500 overflow-hidden">
          {/* Header */}
          <div className={`p-8 ${partnerColor} text-white flex justify-between items-center relative overflow-hidden transition-colors duration-500`}>
            <div className="flex items-center space-x-4 relative z-10">
              <img src={activePartner.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-xl" alt="" />
              <div>
                <span className="font-black text-lg tracking-tight leading-none block">{activePartner.name}</span>
                <div className="flex items-center space-x-2 mt-1">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/70">{activePartner.role || 'Partner'} Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all">
              <Icons.Close />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-5 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm ${
                  msg.isAi 
                    ? 'bg-white text-gray-800 border border-gray-100 rounded-bl-none' 
                    : `${partnerColor} text-white rounded-br-none`
                }`}>
                  {msg.text}
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${msg.isAi ? 'text-gray-300' : 'text-white/50'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-[28px] border border-gray-100 flex space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${partnerColor}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce delay-150 ${partnerColor}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce delay-300 ${partnerColor}`}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-8 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Chat with ${activePartner.name}...`}
                  className="w-full pl-6 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-[28px] focus:ring-4 focus:ring-purple-100 focus:bg-white outline-none transition-all font-bold text-gray-900 text-sm shadow-inner"
                />
                <div className="absolute right-3 top-3">
                   <VoiceDictationButton 
                    onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                    className="p-3 bg-transparent text-gray-300 hover:text-purple-600 shadow-none border-none scale-90"
                    color="bg-transparent"
                   />
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`p-4 text-white rounded-[20px] transition-all shadow-xl disabled:opacity-20 active:scale-95 shrink-0 ${partnerColor}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-white border border-purple-100 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all active:scale-95 group relative"
        >
          <BrandLogo size="sm" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </button>
      )}
    </div>
  );
});

export default AIChatbot;
