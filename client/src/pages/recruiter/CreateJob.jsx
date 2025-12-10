import React, { useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import api from 'src/api';
import { Wallet, Sparkles, X, Loader, Code } from 'lucide-react';

const CreateJob = () => {
  const { account } = useContext(Web3Context);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || {};

  const [formData, setFormData] = useState({ title: '', company: '', location: '', salary: '', description: '', deadline: '', aiEnabled: false });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [testConfig, setTestConfig] = useState(['easy', 'medium', 'hard']);
  const [loading, setLoading] = useState(false);

  const handleSkillKeyDown = (e) => { if (e.key === 'Enter' && skillInput) { e.preventDefault(); if (!skills.includes(skillInput)) setSkills([...skills, skillInput]); setSkillInput(''); } };
  const removeSkill = (s) => setSkills(skills.filter(i => i !== s));
  const handleChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!account) return alert("Connect Wallet!");
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({ to: "0xcD7fA151d4077E49ed73236B87a583825887131a", value: ethers.parseEther("0.00001") });
      await tx.wait();
      
      // --- 2. THE FIX: USE 'api' INSTEAD OF 'axios' ---
      await api.post('/api/jobs', { 
          ...formData, 
          skills, 
          walletAddress: account, 
          txHash: tx.hash, 
          isPaid: true, 
          aiInterviewEnabled: formData.aiEnabled,
          recruiterEmail: user.email,
          testConfig: testConfig
      });
      
      alert("Success!"); navigate('/recruiter/dashboard');
    } catch (error) { 
        console.error("Post Job Error:", error);
        alert("Failed to post job."); 
    } finally { 
        setLoading(false); 
    }
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '40px', backgroundColor: '#f8fafc', color: '#0f172a' },
    card: { width: '100%', maxWidth: '800px', backgroundColor: 'white', padding: '50px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    title: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', color: '#14532d' },
    inputGroup: { marginBottom: '25px' },
    label: { display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#334155', marginBottom: '8px' },
    input: { width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' },
    payBtn: { width: '100%', padding: '18px', backgroundColor: '#D97706', color: 'white', fontSize: '1.2rem', fontWeight: '800', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.3)' },
    skillTag: { backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', marginRight: '10px', marginBottom: '10px' },
    aiBox: { backgroundColor: '#f0fdf4', border: '2px solid #16a34a', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    testBox: { backgroundColor: '#fff7ed', border: '2px solid #fdba74', padding: '20px', borderRadius: '12px', marginBottom: '25px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Post a New Job</h1>
        <form onSubmit={handlePostJob}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={styles.inputGroup}><label style={styles.label}>Job Title</label><input name="title" required onChange={handleChange} style={styles.input} placeholder="e.g. React Dev" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Company</label><input name="company" required onChange={handleChange} style={styles.input} /></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={styles.inputGroup}><label style={styles.label}>Location</label><input name="location" required onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Budget (ETH)</label><input name="salary" required onChange={handleChange} style={styles.input} /></div>
          </div>

          <div style={styles.inputGroup}><label style={styles.label}>Description</label><textarea name="description" required onChange={handleChange} style={{...styles.input, fontFamily: 'inherit'}} rows="4" /></div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Required Skills (Enter to add)</label>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} style={styles.input} placeholder="Type & Enter" />
            <div style={{ marginTop: '10px' }}>{skills.map(s => <span key={s} style={styles.skillTag}>{s}<button type="button" onClick={() => removeSkill(s)} style={{border:'none', background:'none', marginLeft:'8px', cursor:'pointer', fontWeight:'bold'}}>×</button></span>)}</div>
          </div>

          <div style={styles.aiBox}>
            <div><h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center' }}><Sparkles size={20} style={{marginRight:'10px'}}/> Enable AI Interviewer?</h4></div>
            <input type="checkbox" name="aiEnabled" onChange={handleChange} style={{ width: '24px', height: '24px', accentColor: '#16a34a' }} />
          </div>

          {formData.aiEnabled && (
            <div style={styles.testBox}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#ea580c', display: 'flex', alignItems: 'center' }}><Code size={20} style={{marginRight:'10px'}}/> Technical Test Configuration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    {['Q1', 'Q2', 'Q3'].map((q, idx) => (
                        <div key={idx}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{q} Difficulty</label>
                            <select 
                                value={testConfig[idx]}
                                onChange={(e) => {
                                    const newConfig = [...testConfig];
                                    newConfig[idx] = e.target.value;
                                    setTestConfig(newConfig);
                                }}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fdba74', backgroundColor: 'white' }}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>
          )}

          <div style={styles.inputGroup}><label style={styles.label}>Deadline</label><input type="date" name="deadline" required onChange={handleChange} style={styles.input} /></div>

          <button type="submit" disabled={loading} style={styles.payBtn}>
            {loading ? "Processing..." : <><Wallet className="mr-3"/> Pay 0.00001 ETH & Post</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;