import React, { useState, useEffect, useContext } from 'react';
import { Plus, Users, Search, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import axios from 'axios';

const RecruiterDashboard = () => {
  const { account, connectWallet } = useContext(Web3Context);
  const [jobs, setJobs] = useState([]);
  const user = JSON.parse(localStorage.getItem('userInfo')) || {}; // Get Current User

  // --- FETCH & FILTER BY EMAIL (IDENTITY) ---
  const fetchMyJobs = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        if (res.data.success) {
            const allJobs = res.data.data;
            
            if (user.email) {
                // Filter: Match Job Creator's Email with Login Email
                const myJobs = allJobs.filter(job => 
                    job.recruiterEmail === user.email
                );
                setJobs(myJobs);
            }
        }
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [account, user.email]);

  // --- THEME: WHITE + GREEN + DIMMER GOLD (#D97706) ---
  const styles = {
    page: { backgroundColor: '#ffffff', minHeight: '100vh', padding: '40px', color: '#1e293b', fontFamily: 'sans-serif' },
    headerTitle: { fontSize: '2.5rem', fontWeight: '800', color: '#14532d' },
    
    // Dimmer Gold Button
    postBtn: { 
        backgroundColor: '#D97706', color: 'white', // Dimmer Amber
        padding: '12px 24px', borderRadius: '10px', border: 'none', 
        fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center',
        boxShadow: '0 4px 10px rgba(217, 119, 6, 0.4)' 
    },
    
    walletBox: { display: 'flex', alignItems: 'center', padding: '10px 20px', borderRadius: '10px', border: '2px solid #16a34a', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '600' },
    
    statsCard: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' },
    statsValue: { fontSize: '2.5rem', fontWeight: '800', color: '#16a34a' },
    
    tableHeader: { backgroundColor: '#f0fdf4', color: '#15803d', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' },
    activeBadge: { backgroundColor: '#D97706', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }
  };

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={styles.headerTitle}>Recruiting Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome, {user.name || "Recruiter"}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={styles.walletBox}>
                <Wallet size={20} style={{ marginRight: '10px' }}/>
                <span>{account ? `${account.slice(0,6)}...` : <button onClick={connectWallet} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer' }}>Connect</button>}</span>
            </div>
            <Link to="/recruiter/create-job" style={{ textDecoration: 'none' }}>
              <button style={styles.postBtn}>
                <Plus size={24} style={{ marginRight: '8px' }} /> Post New Job
              </button>
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '50px' }}>
            <div style={styles.statsCard}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>MY ACTIVE JOBS</p>
                <div style={styles.statsValue}>{jobs.length}</div>
                <div style={{ height: '4px', width: '50px', backgroundColor: '#D97706', marginTop: '15px' }}></div>
            </div>
            <div style={styles.statsCard}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>TOTAL APPLICANTS</p>
                <div style={styles.statsValue}>0</div>
                <div style={{ height: '4px', width: '50px', backgroundColor: '#16a34a', marginTop: '15px' }}></div>
            </div>
            <div style={styles.statsCard}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>WALLET BALANCE</p>
                <div style={styles.statsValue}>ETH</div>
                <div style={{ height: '4px', width: '50px', backgroundColor: '#D97706', marginTop: '15px' }}></div>
            </div>
        </div>

        {/* TABLE */}
        <div style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>My Job Postings</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead style={styles.tableHeader}>
                    <tr>
                        <th style={{ padding: '20px' }}>Job Title</th>
                        <th style={{ padding: '20px' }}>Status</th>
                        <th style={{ padding: '20px' }}>Candidates</th>
                        <th style={{ padding: '20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ color: '#334155', fontWeight: '500' }}>
                    {jobs.length > 0 ? jobs.map(job => (
                        <tr key={job._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '20px', fontSize: '1.1rem' }}>{job.title}</td>
                            <td style={{ padding: '20px' }}><span style={styles.activeBadge}>Active</span></td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', color: '#16a34a' }}>
                                    <Users size={18} style={{ marginRight: '8px' }} /> View List
                                </div>
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                {/* --- THE FIX IS HERE --- */}
                                <Link to={`/recruiter/ats/${job._id}`} style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 'bold', borderBottom: '2px solid #D97706' }}>Manage Candidates</Link>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                You haven't posted any jobs yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;