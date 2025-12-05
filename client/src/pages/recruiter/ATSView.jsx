import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Check, X, MessageSquare, Star } from 'lucide-react';
import axios from 'axios';

const ATSView = () => {
  const { jobId } = useParams(); // Get Job ID from URL
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH CANDIDATES ---
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/candidates/${jobId}`);
      if (res.data.success) {
        setCandidates(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  // --- UPDATE STATUS ACTION ---
  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/jobs/status/${appId}`, { status: newStatus });
      fetchCandidates(); // Refresh UI
      alert(`Candidate moved to ${newStatus}`);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // --- STYLES (Dark Mode Enforced) ---
  const pageStyle = { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '2rem' };
  const cardStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const badgeStyle = (status) => {
    const colors = {
      'Applied': '#94a3b8', 'ATS': '#3b82f6', 'HR': '#eab308', 'Manager': '#a855f7', 'Hired': '#22c55e', 'Rejected': '#ef4444'
    };
    return { backgroundColor: `${colors[status] || '#94a3b8'}33`, color: colors[status] || '#cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' };
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <button onClick={() => navigate('/recruiter/dashboard')} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '20px' }}>
            <ArrowLeft size={18} style={{ marginRight: '5px' }} /> Back to Dashboard
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px' }}>Applicant Pipeline</h1>

        {/* LOADING STATE */}
        {loading && <div style={{ color: '#94a3b8' }}>Loading candidates...</div>}

        {/* CANDIDATE LIST */}
        {!loading && candidates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', border: '1px dashed #334155', borderRadius: '12px' }}>
                No applicants yet.
            </div>
        ) : (
            candidates.map(app => (
                <div key={app._id} style={cardStyle}>
                    
                    {/* LEFT: INFO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color="#cbd5e1" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Candidate {app.applicantWallet.slice(0,6)}...</h3>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <span style={badgeStyle(app.status)}>{app.status}</span>
                                <span style={{ fontSize: '0.8rem', color: '#2dd4bf', display: 'flex', alignItems: 'center' }}>
                                    <Star size={12} style={{marginRight:'4px'}}/> AI Score: {app.interviewScore || 85}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: ACTIONS (The Control Room) */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        
                        {/* 1. MOVE TO HR */}
                        {app.status === 'Applied' && (
                            <button onClick={() => updateStatus(app._id, 'ATS')} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Pass ATS
                            </button>
                        )}
                        {app.status === 'ATS' && (
                            <button onClick={() => updateStatus(app._id, 'HR')} style={{ backgroundColor: '#eab308', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Start HR
                            </button>
                        )}
                        {app.status === 'HR' && (
                            <button onClick={() => updateStatus(app._id, 'Manager')} style={{ backgroundColor: '#a855f7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Manager Round
                            </button>
                        )}
                        {app.status === 'Manager' && (
                            <button onClick={() => updateStatus(app._id, 'Hired')} style={{ backgroundColor: '#22c55e', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                HIRE NOW
                            </button>
                        )}

                        {/* REJECT BUTTON */}
                        {app.status !== 'Rejected' && app.status !== 'Hired' && (
                            <button onClick={() => updateStatus(app._id, 'Rejected')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Reject">
                                <X size={20} />
                            </button>
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