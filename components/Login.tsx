
import React, { useState } from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLoginComplete: (role: UserRole, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginComplete }) => {
  const [step, setStep] = useState<'auth' | 'loading' | 'role'>('auth');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<any>(null);

  const handleGoogleLogin = async () => {
    setStep('loading');
    
    // In a real environment with configured OAuth:
    // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    
    // For this simulation within the constraints, we mimic the successful response
    // and store a mock user in Supabase to demonstrate connectivity.
    setTimeout(async () => {
      const mockEmail = `user_${Math.floor(Math.random() * 1000)}@gmail.com`;
      setUser({ email: mockEmail, id: 'temp-uuid' });
      setStep('role');
    }, 1500);
  };

  const handleComplete = async () => {
    if (selectedRole && user) {
      // Persist profile to Supabase
      await supabase.from('profiles').upsert({
        id: user.id || 'temp-id',
        email: user.email,
        role: selectedRole,
        full_name: user.email.split('@')[0]
      });
      
      onLoginComplete(selectedRole, user);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.Google />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Authenticating</h2>
        <p className="text-gray-500 font-medium">Connecting to WeConnect Secure Layer...</p>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-8">
             <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
               ✓ Authenticated: {user?.email}
             </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Choose your path</h1>
          <p className="text-gray-500 mb-12 text-lg">Help us customize your workspace based on your role.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button 
              onClick={() => setSelectedRole('brand')}
              className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center text-left group ${
                selectedRole === 'brand' 
                  ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100' 
                  : 'border-gray-100 bg-white hover:border-purple-200'
              }`}
            >
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${selectedRole === 'brand' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                <Icons.Brand />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Brand</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Search creators & manage campaigns.</p>
            </button>

            <button 
              onClick={() => setSelectedRole('influencer')}
              className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center text-left group ${
                selectedRole === 'influencer' 
                  ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100' 
                  : 'border-gray-100 bg-white hover:border-purple-200'
              }`}
            >
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${selectedRole === 'influencer' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                <Icons.Influencer />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Influencer</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Build portfolio & find brand deals.</p>
            </button>
          </div>

          <button 
            onClick={handleComplete}
            disabled={!selectedRole}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
              selectedRole 
                ? 'bg-purple-600 text-white shadow-xl hover:bg-purple-700 active:scale-[0.98]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Launch Dashboard</span>
            <Icons.Robot />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-xl rounded-[48px] shadow-2xl w-full max-w-lg p-12 text-center border border-white/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 rotate-3">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">WeConnect</h1>
        <p className="text-gray-500 mb-12 text-xl font-medium">AI-driven influencer marketing at scale.</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-gray-100 py-5 px-8 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95 text-lg"
          >
            <Icons.Google />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
