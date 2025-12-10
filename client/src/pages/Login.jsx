import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, User, ArrowRight, Hexagon } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiRole, setUiRole] = useState('seeker'); // Just for UI color switching

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Attempting Login for:", email);

    try {
      // 1. Send Credentials to Backend
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      console.log("Server Response:", res.data);

      // 2. CHECK SUCCESS
      if (res.data.success) {
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        alert("Login Successful!");

        // 3. Redirect based on DATABASE role (not the UI toggle)
        if (res.data.role === 'seeker') {
          navigate('/seeker/dashboard');
        } else {
          navigate('/recruiter/dashboard');
        }
      }
    } catch (error) {
      console.error("Login Failed:", error);
      // 4. Handle Failure
      const errorMsg = error.response?.data?.message || "Invalid Email or Password";
      alert("❌ " + errorMsg); // Show Alert on failure
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const containerStyle = { minHeight: '100vh', display: 'flex', fontFamily: 'sans-serif' };
  
  const leftPanelStyle = {
    flex: '5',
    background: uiRole === 'seeker' ? '#0f172a' : '#022c22',
    color: 'white',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'background 0.5s'
  };

  const rightPanelStyle = { flex: '7', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
  const inputStyle = { width: '100%', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '1rem', outline: 'none', marginBottom: '1rem' };

  return (
    <div style={containerStyle}>
      
      {/* LEFT SIDE */}
      <div className="hidden lg:flex" style={leftPanelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>NexWork</span>
        </div>
        <div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>Welcome Back.</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Log in to access your verified professional network.</p>
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>© 2025 NexWork Inc.</div>
      </div>

      {/* RIGHT SIDE */}
      <div style={rightPanelStyle}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>Login</h2>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Enter your email and password.</p>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '12px', marginBottom: '30px' }}>
            <button type="button" onClick={() => setUiRole('seeker')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: uiRole === 'seeker' ? 'white' : 'transparent', color: uiRole === 'seeker' ? '#2563eb' : '#64748b', boxShadow: uiRole === 'seeker' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Job Seeker Look</button>
            <button type="button" onClick={() => setUiRole('recruiter')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: uiRole === 'recruiter' ? 'white' : 'transparent', color: uiRole === 'recruiter' ? '#0f766e' : '#64748b', boxShadow: uiRole === 'recruiter' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>Recruiter Look</button>
          </div>

          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', color: 'white', background: uiRole === 'seeker' ? '#2563eb' : '#0d9488', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Verifying..." : "Login"} <ArrowRight size={20} style={{ display:'inline', marginLeft:'8px' }} />
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Don't have an account? <Link to="/register" style={{ color: uiRole === 'seeker' ? '#2563eb' : '#0f766e', fontWeight: 'bold', textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;