
import React, { useState, useEffect } from 'react';
import { Icons, BrandLogo } from '../constants';

interface LandingPageProps {
  onEnterLogin: () => void;
  onEnterExplore: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterLogin, onEnterExplore }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-purple-100 selection:text-purple-900 relative">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float3D {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          33% { transform: translate3d(30px, -50px, 100px) rotate(120deg); }
          66% { transform: translate3d(-20px, 20px, -50px) rotate(240deg); }
          100% { transform: translate3d(0, 0, 0) rotate(360deg); }
        }
        @keyframes meshFlow {
          0% { transform: perspective(1000px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(1000px) rotateX(60deg) translateY(-100px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; filter: blur(40px); }
          50% { opacity: 0.6; filter: blur(60px); }
        }
        
        .animate-reveal { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        .bg-3d-sphere {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.05));
          filter: blur(2px);
          pointer-events: none;
          animation: float3D linear infinite;
        }

        .neural-mesh {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background-image: 
            linear-gradient(rgba(124, 58, 237, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: meshFlow 20s linear infinite;
          z-index: 0;
        }
        
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .flip-card-inner {
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }
        .flipped .flip-card-inner { transform: rotateY(180deg); }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 3D Neural Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* The floor mesh */}
        <div className="neural-mesh"></div>
        
        {/* Animated 3D floating spheres */}
        <div className="bg-3d-sphere w-[400px] h-[400px] top-[10%] left-[5%]" style={{ animationDuration: '25s' }}></div>
        <div className="bg-3d-sphere w-[300px] h-[300px] top-[60%] left-[70%]" style={{ animationDuration: '18s', animationDelay: '-5s' }}></div>
        <div className="bg-3d-sphere w-[500px] h-[500px] top-[20%] left-[40%] bg-indigo-50/10" style={{ animationDuration: '30s', animationDelay: '-10s' }}></div>
        
        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-100 rounded-full opacity-40 blur-[120px] animate-[glowPulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-100 rounded-full opacity-30 blur-[150px] animate-[glowPulse_12s_ease-in-out_infinite_2s]"></div>
      </div>

      {/* Hero */}
      <div className="relative pt-32 pb-32 lg:pt-48 lg:pb-56 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-20 items-center">
            
            <div className="lg:col-span-7 space-y-10">
              <div className="animate-reveal opacity-0 inline-flex items-center space-x-4 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl shadow-purple-50 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-purple-600">
                <BrandLogo size="sm" className="drop-shadow-none" />
                <span>Neural Ecosystem v4.0</span>
              </div>
              
              <h1 className="animate-reveal delay-100 opacity-0 text-7xl lg:text-[100px] font-black text-gray-900 tracking-tighter leading-[0.85]">
                Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Brand</span><br/>With AI.
              </h1>
              
              <p className="animate-reveal delay-200 opacity-0 text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
                The easiest way for brands to find creators and for creators to land big deals. Simple, smart, and built for everyone.
              </p>
              
              <div className="animate-reveal delay-300 opacity-0 flex flex-col sm:flex-row gap-6 pt-6">
                <button 
                  onClick={onEnterExplore}
                  className="px-12 py-6 bg-gray-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 group flex items-center justify-center space-x-3"
                >
                  <span>Start Exploring</span>
                  <Icons.Discover />
                </button>
                <button 
                  onClick={onEnterLogin}
                  className="px-12 py-6 bg-white border-2 border-gray-100 text-gray-900 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] hover:border-purple-200 transition-all hover:text-purple-600 active:scale-95"
                >
                  Sign Up Free
                </button>
              </div>
              
              <div className="animate-reveal delay-300 opacity-0 flex items-center space-x-8 pt-10 border-t border-gray-50">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/${i+50}/100`} className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg" alt="" />
                  ))}
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 leading-none">12,000+</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Active Users</p>
                </div>
              </div>
            </div>

            {/* Role Card */}
            <div className="animate-reveal delay-200 opacity-0 mt-20 lg:mt-0 lg:col-span-5 flex justify-center perspective-1000">
              <div className={`w-full max-w-sm aspect-[3/4] cursor-pointer group ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                <div className="relative w-full h-full flip-card-inner">
                  
                  {/* Front: Brand */}
                  <div className="absolute inset-0 backface-hidden bg-white/90 backdrop-blur-md border border-gray-100 rounded-[64px] p-12 flex flex-col justify-between text-gray-900 shadow-3xl shadow-purple-100 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-purple-600 rounded-[28px] flex items-center justify-center mb-10 shadow-xl shadow-purple-200 text-white">
                        <Icons.Brand />
                      </div>
                      <h3 className="text-5xl font-black leading-none mb-6 tracking-tight">I'm a<br/><span className="text-purple-600">Brand</span></h3>
                      <p className="text-gray-500 font-medium leading-relaxed">I want to find the perfect creators to help grow my business and reach more people.</p>
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-purple-600 w-1/3"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Click to Switch</p>
                        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-purple-600 transition-all">
                          <Icons.Settings />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back: Creator */}
                  <div className="absolute inset-0 backface-hidden bg-gray-900 rounded-[64px] p-12 flex flex-col justify-between text-white shadow-3xl shadow-gray-200 rotate-y-180 overflow-hidden border border-white/5">
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center mb-10 shadow-xl shadow-indigo-900 text-white">
                        <Icons.Influencer />
                      </div>
                      <h3 className="text-5xl font-black leading-none mb-6 tracking-tight">I'm a<br/><span className="text-indigo-400">Creator</span></h3>
                      <p className="text-gray-400 font-medium leading-relaxed">I want to build my portfolio, work with top brands, and make more money doing what I love.</p>
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-indigo-400 w-2/3"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Back to Brand</p>
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-all">
                          <Icons.Settings />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50/50 py-40 border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-32 max-w-3xl mx-auto space-y-6">
            <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-none">Smart Features.</h2>
            <p className="text-gray-500 text-xl font-medium leading-relaxed">We use AI to take the guesswork out of marketing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              { title: 'Smart Matching', desc: 'Our AI finds creators who actually match your brand style and target audience.', icon: Icons.Robot, color: 'bg-purple-600' },
              { title: 'Easy Payments', desc: 'Secure payments that are only released once the work is finished and approved.', icon: Icons.Wallet, color: 'bg-indigo-600' },
              { title: 'Detailed Reports', desc: 'See exactly how your campaigns are performing with easy-to-read data.', icon: Icons.Analytics, color: 'bg-pink-600' }
            ].map((f, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-12 rounded-[56px] border border-gray-100 hover:shadow-3xl transition-all group relative overflow-hidden flex flex-col items-start">
                <div className={`w-20 h-20 ${f.color} rounded-[28px] flex items-center justify-center text-white mb-10 group-hover:scale-110 shadow-2xl transition-all`}>
                  <f.icon />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-10">{f.desc}</p>
                <button className="mt-auto text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center space-x-2">
                  <span>Learn More</span>
                  <Icons.Campaigns />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-900 rounded-[80px] p-24 text-center text-white relative overflow-hidden shadow-3xl">
             <div className="relative z-10 space-y-12 max-w-4xl mx-auto">
                <h2 className="text-6xl lg:text-8xl font-black tracking-tighter leading-none">Ready to start?</h2>
                <p className="text-2xl text-purple-100 font-medium opacity-80">Join the thousands of users growing their businesses with WeConnect.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                  <button onClick={onEnterLogin} className="px-16 py-8 bg-white text-purple-700 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] hover:scale-105 shadow-2xl transition-all">
                    Sign Up Now
                  </button>
                  <button onClick={onEnterExplore} className="px-16 py-8 bg-purple-700/50 backdrop-blur-xl border border-white/20 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] hover:bg-purple-700 transition-all">
                    Browse Creators
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 pt-32 pb-20 text-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center space-x-6">
              <BrandLogo size="lg" />
              <span className="text-4xl font-black tracking-tighter">WeConnect</span>
            </div>
            <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-md">Making influencer marketing simple and smart for everyone.</p>
          </div>
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.4em] mb-10 text-purple-400">Company</h4>
            <ul className="space-y-6 text-gray-400 font-bold uppercase text-xs tracking-widest">
              <li><button onClick={onEnterExplore} className="hover:text-white">Explore</button></li>
              <li><button className="hover:text-white">About Us</button></li>
              <li><button className="hover:text-white">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.4em] mb-10 text-purple-400">Support</h4>
            <ul className="space-y-6 text-gray-400 font-bold uppercase text-xs tracking-widest">
              <li><button className="hover:text-white">Help Center</button></li>
              <li><button className="hover:text-white">Privacy</button></li>
              <li><button className="hover:text-white">Terms</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
