import React, { useState, useEffect, useContext } from 'react';
import { Search, Clock, Zap, Filter, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import JobDetailModal from '../../components/JobDetailModal';
import { Web3Context } from '../../context/Web3Context';

const SeekerDashboard = () => {
  const { account } = useContext(Web3Context);
  const [activeTab, setActiveTab] = useState('recommended'); 
  const [jobs, setJobs] = useState([]); 
  const [applications, setApplications] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);
  
  const [sortBy, setSortBy] = useState('match'); 

  // --- STRICT RECOMMENDATION TITLES ---
  const RECOMMENDED_TITLES = [
    "Machine Learning Engineer", 
    "Deep Learning Engineer", 
    "AI/ML Research Engineer", 
    "Full Stack AI Developer", 
    "MLOps Intern", 
    "AI DevOps Engineer"
  ];

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const jobRes = await axios.get('http://localhost:5000/api/jobs');
      if (jobRes.data.success) setJobs(jobRes.data.data);

      if (account) {
        const appRes = await axios.get(`http://localhost:5000/api/jobs/applications/${account}`);
        if (appRes.data.success) setApplications(appRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [account]);

  // --- DELETE ACTIONS ---
  const handleDeleteJob = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Delete this Job Post?")) {
        await axios.delete(`http://localhost:5000/api/jobs/${id}`);
        fetchData();
    }
  }

  const handleDeleteApp = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Remove this application?")) {
        await axios.delete(`http://localhost:5000/api/jobs/application/${id}`);
        fetchData();
    }
  }

  // --- LOGIC: HARDCODED MATCH SCORES ---
  const getMatchScore = (jobTitle) => {
    const title = jobTitle.toLowerCase();
    
    if (title.includes("machine learning engineer")) return 89;
    if (title.includes("deep learning engineer")) return 78;
    if (title.includes("ai/ml research engineer") || title.includes("research engineer")) return 75;
    if (title.includes("full stack ai")) return 78;
    if (title.includes("mlops")) return 55;
    if (title.includes("ai devops")) return 95;
    
    return 0; // Default for other jobs
  };

  // --- HELPER: Sort Logic ---
  const getSortedJobs = () => {
    // 1. FILTER: Only show jobs that match the Titles
    let relevantJobs = jobs.filter(job => {
        return RECOMMENDED_TITLES.some(title => 
            job.title.toLowerCase().includes(title.toLowerCase())
        );
    });

    // 2. SORT: Apply the sort logic
    return relevantJobs.sort((a, b) => {
        if (sortBy === 'match') {
            return getMatchScore(b.title) - getMatchScore(a.title); // Highest % first
        } else if (sortBy === 'deadline') {
            return new Date(a.deadline) - new Date(b.deadline); 
        }
        return 0;
    });
  };

  // --- COMPONENT: Job Card ---
  const JobCard = ({ job, isRecommended }) => {
    const score = getMatchScore(job.title); // Use Title for Score
    const deadlineDate = new Date(job.deadline);
    const today = new Date();
    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft = diffTime > 0 ? diffTime : 0;

    return (
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', position: 'relative' }}>
        
        {/* Match Badge (Top Right) */}
        {isRecommended && (
          <div style={{ 
              position: 'absolute', top: 0, right: 0, 
              backgroundColor: score > 60 ? '#22c55e' : '#eab308', 
              color: 'black', fontSize: '0.75rem', fontWeight: 'bold', 
              padding: '4px 12px', borderBottomLeftRadius: '12px',
              zIndex: 10
          }}>
            {score}% MATCH
          </div>
        )}

        {/* Delete Job (MOVED TO TOP LEFT TO FIX OVERLAP) */}
        <button 
            onClick={(e) => handleDeleteJob(e, job._id)}
            style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            title="Delete Job"
        >
            <Trash2 size={16} />
        </button>

        {/* Added paddingLeft to avoid overlap with new Trash position */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', paddingRight: '40px', paddingLeft: '25px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{job.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>{job.company} • {job.location}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', color: '#2dd4bf', fontWeight: 'bold', fontFamily: 'monospace' }}>{job.salary}</span>
          </div>
        </div>
        
        {/* Skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
          {job.skills.map((skill, index) => (
            <span key={index} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#334155', color: '#cbd5e1' }}>
              {skill}
            </span>
          ))}
        </div>

        {/* Footer Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: daysLeft < 3 ? '#f87171' : '#94a3b8', fontWeight: daysLeft < 3 ? 'bold' : 'normal' }}>
            <Clock size={12} style={{ marginRight: '4px' }} /> {daysLeft} Days Left
          </div>
          
          <button onClick={() => setSelectedJob(job)} style={{ backgroundColor: job.aiInterviewEnabled ? '#7e22ce' : '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {job.aiInterviewEnabled ? <><Zap size={14} style={{marginRight:'5px'}}/> View & Interview</> : "View Details"}
          </button>
        </div>
      </div>
    );
  };

  // --- COMPONENT: Applied Card ---
  const AppliedCard = ({ app }) => {
    const job = app.jobId || {}; 
    const isExpanded = expandedAppId === app._id;
    
    const getStageColor = (stageName) => {
        const stages = ['Applied', 'ATS', 'HR', 'Manager', 'Hired'];
        const currentIdx = stages.indexOf(app.status);
        const stageIdx = stages.indexOf(stageName);
        if (app.status === 'Rejected') return 'red';
        if (currentIdx > stageIdx) return 'green';
        if (currentIdx === stageIdx) return 'yellow';
        return 'gray';
    };

    const renderLight = (color) => {
        const baseStyle = {width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'};
        if (color === 'green') return <div style={{...baseStyle, background:'#22c55e'}}><CheckCircle size={16} color="black"/></div>;
        if (color === 'yellow') return <div style={{...baseStyle, background:'#eab308', boxShadow:'0 0 10px #eab308'}}></div>;
        if (color === 'red') return <div style={{...baseStyle, background:'#ef4444'}}><XCircle size={16} color="white"/></div>;
        return <div style={{...baseStyle, background:'#334155', border:'1px solid #475569'}}></div>;
    };

    return (
      <div 
        onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
        style={{ backgroundColor: '#1e293b', border: isExpanded ? '1px solid #3b82f6' : '1px solid #334155', borderRadius: '12px', marginBottom: '1rem', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s', position: 'relative' }}
      >
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{job.title || "Job Deleted"}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{job.company}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#334155', color: 'white' }}>{app.status}</span>
                
                {/* Trash Icon (No Overlap here either) */}
                <button 
                    onClick={(e) => handleDeleteApp(e, app._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    title="Remove Application"
                >
                    <Trash2 size={18} />
                </button>

                {isExpanded ? <ChevronUp size={20} color="#94a3b8"/> : <ChevronDown size={20} color="#94a3b8"/>}
            </div>
        </div>

        {isExpanded && (
            <div style={{ padding: '20px', borderTop: '1px solid #334155', backgroundColor: '#0f172a' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '1px', marginBottom: '15px' }}>APPLICATION PIPELINE</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '2px', backgroundColor: '#334155', zIndex: 0 }}></div>
                    {['ATS', 'HR', 'Manager'].map((stage) => (
                        <div key={stage} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            {renderLight(getStageColor(stage))}
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{stage}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Job Feed</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Welcome, {account ? `${account.slice(0,6)}...` : 'User'}</p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('recommended')} style={{ paddingBottom: '10px', background: 'none', border: 'none', color: activeTab === 'recommended' ? '#2dd4bf' : '#94a3b8', borderBottom: activeTab === 'recommended' ? '2px solid #2dd4bf' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Recommended
          </button>
          <button onClick={() => setActiveTab('all')} style={{ paddingBottom: '10px', background: 'none', border: 'none', color: activeTab === 'all' ? '#3b82f6' : '#94a3b8', borderBottom: activeTab === 'all' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            All Jobs
          </button>
          <button onClick={() => setActiveTab('applied')} style={{ paddingBottom: '10px', background: 'none', border: 'none', color: activeTab === 'applied' ? '#a855f7' : '#94a3b8', borderBottom: activeTab === 'applied' ? '2px solid #a855f7' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Applied ({applications.length})
          </button>
        </div>

        {/* --- RECOMMENDED TAB FILTER --- */}
        {activeTab === 'recommended' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: '8px', padding: '4px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0 8px', display: 'flex', alignItems: 'center' }}><Filter size={12} style={{marginRight:'4px'}}/> Sort by:</span>
                    <button 
                        onClick={() => setSortBy('match')}
                        style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: sortBy === 'match' ? 'rgba(45, 212, 191, 0.2)' : 'transparent', color: sortBy === 'match' ? '#2dd4bf' : '#94a3b8' }}
                    >
                        Skill Match
                    </button>
                    <button 
                        onClick={() => setSortBy('deadline')}
                        style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: sortBy === 'deadline' ? 'rgba(248, 113, 113, 0.2)' : 'transparent', color: sortBy === 'deadline' ? '#f87171' : '#94a3b8' }}
                    >
                        Deadline
                    </button>
                </div>
            </div>
        )}

        {/* CONTENT AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {loading && <div style={{textAlign: 'center', color: '#94a3b8'}}>Loading jobs...</div>}

          {/* TAB 1: RECOMMENDED */}
          {activeTab === 'recommended' && !loading && (
             getSortedJobs().length > 0 
             ? getSortedJobs().map(job => <JobCard key={job._id} job={job} isRecommended={true} />)
             : <div style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>
                 No matching jobs found.<br/>
                 <span style={{fontSize:'0.8rem'}}>Try: "Machine Learning Engineer" or "Deep Learning Engineer"</span>
               </div>
          )}

          {/* TAB 2: ALL JOBS */}
          {activeTab === 'all' && !loading && (
             jobs.length > 0
             ? jobs.map(job => <JobCard key={job._id} job={job} />)
             : <div style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>No jobs found.</div>
          )}

          {/* TAB 3: APPLIED */}
          {activeTab === 'applied' && (
             applications.length > 0 
             ? applications.map(app => <AppliedCard key={app._id} app={app} />)
             : <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>You haven't applied yet.</div>
          )}

        </div>

        {/* MODAL */}
        {selectedJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)}
            onApplied={() => {
                alert("Application Submitted!");
                setSelectedJob(null);
                fetchData(); 
                setActiveTab('applied'); 
            }} 
          />
        )}

      </div>
    </div>
  );
};

export default SeekerDashboard;