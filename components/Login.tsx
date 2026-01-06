
import React, { useState } from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface LoginProps {
  onLoginComplete: (user: any, selectedRole: UserRole) => void;
  onCancel: () => void;
  initialMode?: 'login' | 'signup';
}

const Login: React.FC<LoginProps> = ({ onLoginComplete, onCancel, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'role-select'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      const mockUser = { 
        email: email || `user_${Math.floor(Math.random() * 1000)}@gmail.com`, 
        id: 'user-' + Math.random().toString(36).substr(2, 9) 
      };
      setTempUser(mockUser);
      if (mode === 'signup') {
        setMode('role-select');
      } else {
        onLoginComplete(mockUser, 'brand'); // Default to brand for login
      }
      setLoading(false);
    }, 1200);
  };

  const selectRole = (role: UserRole) => {
    onLoginComplete(tempUser, role);
  };

  if (mode === 'role-select') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="bg-white rounded-[64px] shadow-3xl w-full max-w-2xl p-16 text-center relative z-10 animate-in fade-in zoom-in duration-500">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Choose your path</h1>
          <p className="text-gray-500 mb-12 text-lg font-medium">How will you be using WeConnect today?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => selectRole('brand')}
              className="group p-10 bg-white border-4 border-gray-100 rounded-[48px] hover:border-purple-600 transition-all text-left shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Icons.Brand />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">I am a Brand</h3>
              <p className="text-sm text-gray-500 font-medium">I want to hire creators and grow my business.</p>
            </button>

            <button 
              onClick={() => selectRole('influencer')}
              className="group p-10 bg-white border-4 border-gray-100 rounded-[48px] hover:border-indigo-600 transition-all text-left shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Icons.Influencer />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">I am a Creator</h3>
              <p className="text-sm text-gray-500 font-medium">I want to partner with brands and monetize my content.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[64px] shadow-3xl w-full max-w-lg p-16 text-center border border-white relative z-10 animate-in fade-in zoom-in duration-500">
        <button onClick={onCancel} className="absolute top-10 right-10 p-2 text-gray-300 hover:text-gray-900 transition-colors">
          <Icons.Close />
        </button>

        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-200">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
          {mode === 'login' ? 'Sign in to manage your partnerships.' : 'Join the leading influencer marketplace.'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 font-medium"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-2 text-sm">
          <span className="text-gray-400">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-purple-600 font-black hover:underline"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>

        <div className="mt-10 pt-10 border-t border-gray-50">
          <button 
            onClick={() => handleAuth({ preventDefault: () => {} } as any)}
            className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-gray-100 py-4 px-8 rounded-2xl font-black text-gray-700 hover:bg-gray-50 hover:border-purple-200 transition-all shadow-sm active:scale-95"
          >
            <Icons.Google />
            <span className="uppercase tracking-widest text-xs">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
