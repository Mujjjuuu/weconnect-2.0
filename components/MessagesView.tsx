
import React, { useState, useEffect } from 'react';
import { UserProfile, Message } from '../types';
import { Icons } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface MessagesViewProps {
  user: UserProfile;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!isSupabaseConfigured()) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('timestamp', { ascending: false });

        if (!error && data) {
          setMessages(data.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            text: m.text,
            timestamp: new Date(m.timestamp).toLocaleTimeString(),
            isAi: m.is_ai
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user.id]);

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-16">
        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Secure Messaging</h2>
        <p className="text-gray-500 mt-2 font-medium text-lg italic">Persistent, end-to-end conversation logs linked to your cloud identity.</p>
      </div>

      <div className="bg-white rounded-[64px] border border-gray-100 shadow-sm overflow-hidden flex h-[700px]">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-50 bg-gray-50/20 p-8">
           <div className="space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-50 flex items-center space-x-4">
                 <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white">
                    <Icons.Robot />
                 </div>
                 <div>
                    <p className="font-black text-gray-900 leading-none">Neural Support</p>
                    <p className="text-[10px] text-green-500 font-black uppercase mt-1">Active Now</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {loading ? (
             <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : messages.length > 0 ? (
             <div className="flex-1 p-10 overflow-y-auto space-y-6">
               {messages.map(m => (
                 <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-6 rounded-[32px] text-sm font-medium shadow-sm ${
                      m.senderId === user.id ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                       {m.text}
                       <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${m.senderId === user.id ? 'text-white/50' : 'text-gray-300'}`}>
                         {m.timestamp}
                       </p>
                    </div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Icons.Messages />
               </div>
               <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No cloud messages synced</p>
            </div>
          )}
          
          <div className="p-8 border-t border-gray-50">
             <div className="relative">
                <input placeholder="Sync a new message..." className="w-full bg-gray-50 border border-gray-100 rounded-[28px] px-8 py-5 outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 shadow-inner" />
                <button className="absolute right-3 top-3 p-3 bg-gray-900 text-white rounded-2xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
