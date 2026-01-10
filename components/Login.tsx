import React, { useState } from 'react';
import { Icons, BrandLogo } from '../constants';
import { UserRole } from '../types';

interface LoginProps {
  onLoginComplete: (user: any, selectedRole: UserRole) => void;
  onCancel: () => void;
  initialMode?: 'login' | 'signup';
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const Login: React.FC<LoginProps> = ({ onLoginComplete, onCancel, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'role-select'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthFeedback(null);
    
    // Simulate auth handshake
    setTimeout(() => {
      const finalEmail = email || `user_${Math.floor(Math.random() * 1000)}@gmail.com`;
      const mockUser = { 
        email: finalEmail, 
        id: generateUUID() 
      };
      setTempUser(mockUser);
      setAuthFeedback(`Successfully linked identity for ${finalEmail}`);
      
      setTimeout(() => {
        if (mode === 'signup') {
          setMode('role-select');
        } else {
          onLoginComplete(mockUser, 'brand'); 
        }
        setLoading(false);
      }, 1500);
    }, 1200);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setAuthFeedback(null);
    setTimeout(() => {
      const googleEmail = "google.user@gmail.com";
      const mockUser = { email: googleEmail, id: generateUUID() };
      setTempUser(mockUser);
      setAuthFeedback(`Account linked via Google: ${googleEmail}`);
      
      setTimeout(() => {
        setMode('role-select');
        setLoading(false);
      }, 1500);
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
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Activate Workspace</h1>
          <p className="text-gray-500 mb-12 text-lg font-medium">Linked Account: <span className="text-purple-600 font-bold">{tempUser?.email}</span></p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => selectRole('brand')}
              className="group p-10 bg-white border-4 border-gray-100 rounded-[48px] hover:border-purple-600 transition-all text-left shadow-sm hover:shadow-xl active:scale-95"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Icons.Brand />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">I am a Brand</h3>
              <p className="text-sm text-gray-500 font-medium">Hiring verified creators to scale market presence.</p>
            </button>

            <button 
              onClick={() => selectRole('influencer')}
              className="group p-10 bg-white border-4 border-gray-100 rounded-[48px] hover:border-indigo-600 transition-all text-left shadow-sm hover:shadow-xl active:scale-95"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Icons.Influencer />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">I am a Creator</h3>
              <p className="text-sm text-gray-500 font-medium">Monetizing influence through elite brand partnerships.</p>
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
        <button onClick={onCancel} className="absolute top-10 right-10 p-2 text-gray-300 hover:text-gray-900 transition-colors active:scale-90">
          <Icons.Close />
        </button>

        <div className="flex justify-center mb-10">
          <BrandLogo size="xl" className="hover:scale-105 transition-transform" />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          {mode === 'login' ? 'Neural Handshake' : 'Initialize Identity'}
        </h1>
        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
          {mode === 'login' ? 'Synchronize your marketplace access.' : 'Join the elite network of brands and creators.'}
        </p>

        {authFeedback && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-2xl text-[11px] font-black uppercase text-purple-600 tracking-widest animate-in slide-in-from-top-4">
             {authFeedback}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Email Identity</label>
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Neural Key</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-900 shadow-inner"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Enter Platform' : 'Generate Profile'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-2 text-sm">
          <span className="text-gray-400">
            {mode === 'login' ? "New identity?" : "Existing identity?"}
          </span>
          <button 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setAuthFeedback(null); }}
            className="text-purple-600 font-black hover:underline"
          >
            {mode === 'login' ? 'Initialize Now' : 'Sync Instead'}
          </button>
        </div>

        <div className="mt-10 pt-10 border-t border-gray-50">
          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-gray-100 py-4 px-8 rounded-2xl font-black text-gray-700 hover:bg-gray-50 hover:border-purple-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Icons.Google />
            <span className="uppercase tracking-widest text-xs">Sync with Google Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;