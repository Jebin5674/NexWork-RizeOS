import React, { useState, useEffect, useContext } from 'react';
import { Plus, Users, Search, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import axios from 'axios';

const RecruiterDashboard = () => {
  const { account, connectWallet } = useContext(Web3Context);
  const [jobs, setJobs] = useState([]);

  const fetchMyJobs = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        if (res.data.success) {
            setJobs(res.data.data); 
        }
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [account]);

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2dd4bf' }}>Recruiting Dashboard</h1>
            <p style={{ color: '#94a3b8' }}>Manage your job postings.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', display: 'flex', alignItems: 'center' }}>
                <Wallet size={16} color="#2dd4bf" style={{ marginRight: '10px' }}/>
                <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>
                    {account ? `${account.slice(0,6)}...` : <button onClick={connectWallet} style={{ color: '#2dd4bf', background: 'none', border: 'none', cursor: 'pointer' }}>Connect Wallet</button>}
                </span>
            </div>
            <Link to="/recruiter/create-job" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#0d9488', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <Plus size={20} style={{ marginRight: '8px' }} /> Post New Job
              </button>
            </Link>
          </div>
        </div>

        {/* JOBS TABLE */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Your Job Postings</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '15px 25px' }}>Job Title</th>
                        <th style={{ padding: '15px 25px' }}>Status</th>
                        <th style={{ padding: '15px 25px' }}>Posted</th>
                        <th style={{ padding: '15px 25px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.length > 0 ? jobs.map(job => (
                        <tr key={job._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '15px 25px', fontWeight: '500' }}>{job.title}</td>
                            <td style={{ padding: '15px 25px' }}>
                                <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>Active</span>
                            </td>
                            <td style={{ padding: '15px 25px', color: '#94a3b8' }}>
                                {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                                <Link to={`/recruiter/ats/${job._id}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Manage ATS →
                                </Link>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No jobs found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

export default RecruiterDashboard;