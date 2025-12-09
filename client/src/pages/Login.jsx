import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('seeker'); 
  const [email, setEmail] = useState('NexWorkJobSeeker@gmail.com'); // Default
  const navigate = useNavigate();

  // Update Email when Role switches
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'seeker') {
      setEmail('NexWorkJobSeeker@gmail.com');
    } else {
      setEmail('NexWorkRecruiter@gmail.com');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'seeker') {
      navigate('/seeker/setup');
    } else {
      navigate('/recruiter/dashboard');
    }
  };

  // --- NEW "CONNECTED NODES" LOGO ---
  const NexWorkLogo = ({ color }) => (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="42" height="42" rx="10" fill={color} />
      {/* Abstract N / Network Nodes */}
      <circle cx="12" cy="30" r="3" fill="white"/>
      <circle cx="30" cy="12" r="3" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.5"/>
      <path d="M12 27V15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 28L28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M30 15V27" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.5"/>
    </svg>
  );

  // --- STYLES ---
  const containerStyle = { minHeight: '100vh', display: 'flex', fontFamily: '"Inter", sans-serif' };
  
  const leftPanelStyle = {
    flex: '5',
    background: role === 'seeker' 
      ? 'linear-gradient(135deg, #2563eb 0%, #0f172a 100%)' // Brighter Blue
      : 'linear-gradient(135deg, #0d9488 0%, #022c22 100%)', // Teal
    color: 'white',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background 0.8s ease-in-out'
  };

  const rightPanelStyle = {
    flex: '7',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: '500',
    outline: 'none',
    marginBottom: '1rem',
    transition: 'all 0.2s',
  };

  const btnStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      
      {/* LEFT SIDE (Animated) */}
      <div className="hidden lg:flex" style={leftPanelStyle}>
        
        {/* Background Visuals */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)', transition: 'all 1s' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)', transition: 'all 1s' }}></div>
        
        {/* Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10 }}>
          <NexWorkLogo color={role === 'seeker' ? '#1d4ed8' : '#0f766e'} /> 
          <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>NexWork</span>
        </div>

        {/* Hero Text */}
        <div style={{ zIndex: 10 }}>
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: '800', marginBottom: '20px', transition: 'color 0.5s' }}>
            {role === 'seeker' ? 'Find Your' : 'Hire The'} <br/>
            <span style={{ color: role === 'seeker' ? '#bfdbfe' : '#5eead4' }}>
                {role === 'seeker' ? 'Dream Career.' : 'Top Talent.'}
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', maxWidth: '450px' }}>
            {role === 'seeker' 
              ? "Join the decentralized network where your skills speak louder than keywords. AI-verified, Web3-secured."
              : "Access a pool of pre-vetted engineers. Watch AI conduct technical interviews before you even say hello."
            }
          </p>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>© 2025 NexWork Inc.</div>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div style={rightPanelStyle}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Enter your credentials to access the account.</p>
          </div>

          {/* ROLE TOGGLE */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', marginBottom: '30px' }}>
            <button
              onClick={() => handleRoleSwitch('seeker')}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                background: role === 'seeker' ? 'white' : 'transparent',
                color: role === 'seeker' ? '#2563eb' : '#64748b',
                boxShadow: role === 'seeker' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s'
              }}
            >
              <User size={18} /> Job Seeker
            </button>
            <button
              onClick={() => handleRoleSwitch('recruiter')}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                background: role === 'recruiter' ? 'white' : 'transparent',
                color: role === 'recruiter' ? '#0f766e' : '#64748b',
                boxShadow: role === 'recruiter' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s'
              }}
            >
              <Briefcase size={18} /> Recruiter
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                value={email} // Controlled input
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle} 
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Password</label>
              <input type="password" defaultValue="password123" style={inputStyle} />
            </div>

            <button 
              type="submit"
              style={{
                ...btnStyle,
                background: role === 'seeker' ? '#2563eb' : '#0d9488',
                color: 'white',
                boxShadow: role === 'seeker' ? '0 10px 20px rgba(37, 99, 235, 0.2)' : '0 10px 20px rgba(13, 148, 136, 0.2)'
              }}
            >
              {role === 'seeker' ? 'Continue as Candidate' : 'Continue as Recruiter'}
              <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Don't have an account? <span style={{ color: role === 'seeker' ? '#2563eb' : '#0d9488', fontWeight: 'bold', cursor: 'pointer' }}>Sign up</span>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;