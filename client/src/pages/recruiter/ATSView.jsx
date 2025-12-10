import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Check, X, Star } from 'lucide-react';
import api from 'src/api';

const ATSView = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      // --- 2. THE FIX: USE 'api' ---
      const res = await api.get(`/api/jobs/candidates/${jobId}`);
      if (res.data.success) {
        const filteredCandidates = res.data.data.filter(
            app => app.status === 'HR' || app.status === 'Manager' || app.status === 'Hired' || app.status === 'Rejected'
        );
        setCandidates(filteredCandidates);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, [jobId]);

  const updateStatus = async (appId, newStatus) => {
    try {
      // --- 3. THE FIX: USE 'api' ---
      await api.put(`/api/jobs/status/${appId}`, { status: newStatus });
      fetchCandidates(); 
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // --- UI (No Changes) ---
  const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px', color: '#1e293b' },
    backBtn: { display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold' },
    title: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', color: '#14532d' },
    card: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    badge: (status) => {
      const colors = { 'HR': '#fef9c3', 'Manager': '#f3e8ff', 'Hired': '#dcfce7', 'Rejected': '#fee2e2' };
      const textColors = { 'HR': '#854d0e', 'Manager': '#7e22ce', 'Hired': '#166534', 'Rejected': '#991b1b' };
      return { backgroundColor: colors[status] || '#e2e8f0', color: textColors[status] || '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' };
    },
    actionBtn: { border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button onClick={() => navigate('/recruiter/dashboard')} style={styles.backBtn}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Dashboard
        </button>

        <h1 style={styles.title}>AI-Screened Candidates</h1>
        <p style={{color: '#64748b', marginTop: '-30px', marginBottom: '40px'}}>
            Only candidates who passed the AI Voice and Coding tests appear here.
        </p>

        {!loading && candidates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: 'white' }}>
                No candidates have passed the automated screening yet.
            </div>
        ) : (
            candidates.map(app => (
                <div key={app._id} style={styles.card}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div><h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Candidate {app.applicantWallet.slice(0,6)}...</h3></div>
                        <span style={{ ...styles.badge('Hired'), backgroundColor: '#fef3c7', color: '#92400e' }}><Star size={12} style={{display:'inline', marginRight:'4px'}}/> AI Score: {app.interviewScore}%</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        
                        {app.status === 'HR' && (
                            <button onClick={() => updateStatus(app._id, 'Manager')} style={{ ...styles.actionBtn, backgroundColor: '#a855f7', color: 'white' }}>Start Manager Review</button>
                        )}
                        {app.status === 'Manager' && (
                            <button onClick={() => updateStatus(app._id, 'Hired')} style={{ ...styles.actionBtn, backgroundColor: '#22c55e', color: 'black' }}>HIRE</button>
                        )}
                        {app.status !== 'Rejected' && app.status !== 'Hired' && (
                            <button onClick={() => updateStatus(app._id, 'Rejected')} style={{ ...styles.actionBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} title="Reject"><X size={20} /></button>
                        )}
                    </div>

                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ATSView;