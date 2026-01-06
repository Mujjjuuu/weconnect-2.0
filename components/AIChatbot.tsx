
import React, { useState, useRef, useEffect } from 'react';
import { Icons, COLORS } from '../constants';
import { chatWithAi } from '../services/geminiService';
import { Message } from '../types';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Fixed: Updated property 'sender' to 'senderId' and added 'receiverId' to match the Message interface
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'AI', receiverId: 'user', text: "Hi! I'm your WeConnect AI assistant. I can help you find creators, give profile tips, or answer any questions about our platform. What can I do for you?", timestamp: new Date().toLocaleTimeString(), isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Fixed: Updated property 'sender' to 'senderId' and added 'receiverId' to match the Message interface
    const userMsg: Message = { id: Date.now().toString(), senderId: 'You', receiverId: 'AI', text: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAi(input);
      // Fixed: Updated property 'sender' to 'senderId' and added 'receiverId' to match the Message interface
      const aiMsg: Message = { id: (Date.now() + 1).toString(), senderId: 'AI', receiverId: 'You', text: response, timestamp: new Date().toLocaleTimeString(), isAi: true };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      // Fixed: Updated property 'sender' to 'senderId' and added 'receiverId' to match the Message interface
      const errorMsg: Message = { id: (Date.now() + 1).toString(), senderId: 'AI', receiverId: 'You', text: "Sorry, I'm having a little trouble connecting. Please try again in a second!", timestamp: new Date().toLocaleTimeString(), isAi: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[1000]">
      {isOpen ? (
        <div className="w-[380px] h-[600px] bg-white rounded-[40px] shadow-[0_32px_128px_-16px_rgba(124,58,237,0.3)] flex flex-col border border-purple-50 animate-in fade-in slide-in-from-bottom-12 duration-500 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-gray-900 text-white flex justify-between items-center relative overflow-hidden">
            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-2xl text-white">
                <Icons.Robot />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight">AI Help Center</span>
                <div className="flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Online & Ready</span>
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
                    : 'bg-purple-600 text-white rounded-br-none'
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
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-8 bg-white border-t border-gray-100">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question here..."
                className="w-full pl-6 pr-16 py-5 bg-gray-50 border border-gray-100 rounded-[28px] focus:ring-4 focus:ring-purple-100 focus:bg-white outline-none transition-all font-bold text-gray-900 text-sm shadow-inner"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-3 p-3 bg-purple-600 text-white rounded-[20px] hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 disabled:opacity-20 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-purple-600 text-white rounded-[30px] shadow-[0_20px_60px_-15px_rgba(124,58,237,0.5)] flex items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all active:scale-95 group relative"
        >
          <Icons.Robot />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-4 border-white rounded-full"></div>
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
