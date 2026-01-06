
import React, { useState, useRef, useEffect } from 'react';
import { Icons, COLORS } from '../constants';
import { chatWithAi } from '../services/geminiService';
import { Message } from '../types';

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'AI', text: "Hello! I'm your WeConnect AI Assistant. How can I help you scale your influencer marketing today?", timestamp: new Date().toLocaleTimeString(), isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'You', text: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await chatWithAi(input);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'AI', text: response, timestamp: new Date().toLocaleTimeString(), isAi: true };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-[500px] glass rounded-3xl shadow-2xl flex flex-col border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-purple-600 text-white rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-white/20 rounded-lg">
                <Icons.Robot />
              </div>
              <span className="font-bold">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <Icons.Close />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isAi ? 'bg-gray-100 text-gray-800' : 'bg-purple-600 text-white'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white rounded-b-3xl border-t">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-purple-600 text-white rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95"
        >
          <Icons.Robot />
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
