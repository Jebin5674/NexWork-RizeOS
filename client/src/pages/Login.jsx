import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, ArrowRight, Hexagon } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('seeker'); // Default role
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in as:", role);
    
    if (role === 'seeker') {
      navigate('/seeker/setup');
    } else {
      navigate('/recruiter/dashboard');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      backgroundColor: '#0f172a', // Deep Dark Blue (Fallback)
      color: 'white',
      fontFamily: 'sans-serif'
    }} className="min-h-screen flex bg-slate-950 text-white">
      
      {/* LEFT SIDE - BRANDING */}
      <div 
        style={{ backgroundColor: '#1e293b' }} // Lighter Slate (Fallback)
        className="hidden lg:flex w-5/12 flex-col justify-between p-12 border-r border-slate-800 relative overflow-hidden"
      >
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-2 bg-teal-500 rounded-lg">
            <Hexagon className="w-8 h-8 text-white fill-current" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">NexWork</span>
        </div>

        {/* Hero Text */}
        <div className="z-10 max-w-md">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            The Future of <br/>
            <span className="text-teal-400">Decentralized Hiring.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Stop dealing with fake profiles and ghosting. 
            NexWork uses <b>AI Verification</b> and <b>Web3 Payments</b> to ensure trust on both sides.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-slate-500 text-sm">
          © 2025 NexWork Inc. Built for RizeOS.
        </div>

        {/* Decorative Circles (Optional Visuals) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 mt-2">Choose your role to sign in.</p>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800" style={{background: '#1e293b'}}>
            <button
              onClick={() => setRole('seeker')}
              className={`flex items-center justify-center py-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'seeker' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              style={role === 'seeker' ? { backgroundColor: '#2563eb' } : {}}
            >
              <User className="w-4 h-4 mr-2" />
              Job Seeker
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className={`flex items-center justify-center py-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'recruiter' 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              style={role === 'recruiter' ? { backgroundColor: '#0d9488' } : {}}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Recruiter
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                defaultValue="user@nexwork.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }}
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-3.5 rounded-lg font-bold text-white flex items-center justify-center transition-all ${
                role === 'seeker' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' 
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-900/20'
              } shadow-lg`}
              style={{ backgroundColor: role === 'seeker' ? '#2563eb' : '#0d9488' }}
            >
              {role === 'seeker' ? 'Continue as Candidate' : 'Continue as Recruiter'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;