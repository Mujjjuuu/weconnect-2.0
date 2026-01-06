
import React, { useState, useEffect } from 'react';
import { UserProfile, Payment } from '../types';
import { Icons } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface WalletViewProps {
  user: UserProfile;
}

const WalletView: React.FC<WalletViewProps> = ({ user }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!isSupabaseConfigured()) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
          .order('date', { ascending: false });

        if (!error && data) {
          setPayments(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user.id]);

  const totalBalance = payments.reduce((acc, p) => {
    const amt = parseFloat(p.amount.replace(/[^0-9.-]+/g,""));
    return p.type === 'deposit' ? acc + amt : acc - amt;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Wallet Hub</h2>
          <p className="text-gray-500 mt-2 font-medium text-lg">Real-time tracking of your campaign earnings and payouts.</p>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl flex items-center space-x-8">
           <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Assets</p>
             <p className="text-4xl font-black text-gray-900 tracking-tighter">${totalBalance.toLocaleString()}</p>
           </div>
           <button className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all">
             Withdraw Funds
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[64px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-12 border-b border-gray-50">
           <h3 className="text-2xl font-black text-gray-900 tracking-tight">Transaction History</h3>
        </div>
        
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : payments.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {payments.map(p => (
              <div key={p.id} className="p-10 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                 <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {p.type === 'deposit' ? <Icons.Wallet /> : <Icons.Analytics />}
                    </div>
                    <div>
                       <p className="font-black text-gray-900 text-lg">Campaign {p.type === 'payout' ? 'Payment' : 'Deposit'}</p>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.date}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-2xl font-black ${p.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {p.type === 'deposit' ? '+' : '-'}{p.amount}
                    </p>
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500 mt-2">
                       {p.status}
                    </span>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mx-auto mb-6">
                <Icons.Wallet />
             </div>
             <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em]">No transaction data found in database</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletView;
