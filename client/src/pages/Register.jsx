import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, User, ArrowRight, Hexagon, Mail, Lock, Linkedin, Github, Building, BadgeCheck } from 'lucide-react';
import api from '../../api'; // <-- 1. IMPORT THE API HELPER

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('seeker');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    linkedin: '', github: '', 
    companyName: '', currentRole: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // --- 2. THE FIX: USE 'api' ---
      const res = await api.post('/api/auth/register', { ...formData, role });
      
      if (res.data.success) {
        alert("Account Created Successfully!");
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        
        if (role === 'seeker') navigate('/seeker/setup');
        else navigate('/recruiter/dashboard');
      }
    } catch (error) {
      alert("Registration Failed: " + (error.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  // --- UI (No Changes) ---
  const containerStyle = { minHeight: '100vh', display: 'flex', fontFamily: 'sans-serif' };
  const leftStyle = { flex: '4', background: role === 'seeker' ? '#0f172a' : '#022c22', color: 'white', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
  const rightStyle = { flex: '8', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f8fafc' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' };

  return (
    <div style={containerStyle}>
      <div className="hidden lg:flex" style={leftStyle}>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <Hexagon fill="white" /> <span style={{fontSize:'2rem', fontWeight:'bold'}}>NexWork</span>
        </div>
        <h1 style={{fontSize:'3rem', fontWeight:'800'}}>
            {role === 'seeker' ? 'Build Your' : 'Grow Your'} <br/>
            <span style={{color: role==='seeker'?'#60a5fa':'#5eead4'}}>
                {role === 'seeker' ? 'Career.' : 'Team.'}
            </span>
        </h1>
        <p>© 2025 NexWork Inc.</p>
      </div>

      <div style={rightStyle}>
        <div style={{width:'100%', maxWidth:'500px'}}>
          <h2 style={{fontSize:'2rem', fontWeight:'bold', color:'#0f172a', marginBottom:'20px'}}>Create Account</h2>
          
          <div style={{display:'flex', background:'#f1f5f9', padding:'5px', borderRadius:'10px', marginBottom:'20px'}}>
            <button type="button" onClick={() => setRole('seeker')} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', background: role==='seeker'?'white':'transparent', color: role==='seeker'?'#2563eb':'#64748b', boxShadow: role==='seeker'?'0 2px 4px rgba(0,0,0,0.05)': 'none'}}>Job Seeker</button>
            <button type="button" onClick={() => setRole('recruiter')} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', background: role==='recruiter'?'white':'transparent', color: role==='recruiter'?'#0f766e':'#64748b', boxShadow: role==='recruiter'?'0 2px 4px rgba(0,0,0,0.05)': 'none'}}>Recruiter</button>
          </div>

          <form onSubmit={handleRegister}>
            <input name="name" onChange={handleChange} placeholder="Full Name" style={inputStyle} required />
            <input name="email" type="email" onChange={handleChange} placeholder="Email" style={inputStyle} required />
            <input name="password" type="password" onChange={handleChange} placeholder="Password" style={inputStyle} required />
            
            {role === 'seeker' ? (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                    <div>
                        <label style={labelStyle}>LinkedIn URL</label>
                        <input name="linkedin" onChange={handleChange} placeholder="linkedin.com/in/..." style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>GitHub URL</label>
                        <input name="github" onChange={handleChange} placeholder="github.com/..." style={inputStyle} />
                    </div>
                </div>
            ) : (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                    <div>
                        <label style={labelStyle}>Company Name</label>
                        <input name="companyName" onChange={handleChange} placeholder="e.g. Google" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Current Role</label>
                        <input name="currentRole" onChange={handleChange} placeholder="e.g. Hiring Manager" style={inputStyle} />
                    </div>
                </div>
            )}

            <button type="submit" disabled={loading} style={{width:'100%', padding:'14px', background: role==='seeker'?'#2563eb':'#0f766e', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem'}}>
                {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p style={{textAlign:'center', marginTop:'20px', color:'#64748b'}}>
            Already have an account? <Link to="/login" style={{color: role==='seeker'?'#2563eb':'#0f766e', fontWeight:'bold', textDecoration:'none'}}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;