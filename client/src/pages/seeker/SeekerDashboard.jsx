import React, { useState, useEffect, useContext } from 'react';
import { Search, Clock, Zap, Filter, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api'; // <-- 1. IMPORT THE API HELPER
import JobDetailModal from '../../components/JobDetailModal';
import StatusModal from '../../components/StatusModal';
import { Web3Context } from '../../context/Web3Context';

const SeekerDashboard = () => {
  const { account } = useContext(Web3Context);
  
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]); 
  const [applications, setApplications] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [sortBy, setSortBy] = useState('match'); 

  const user = JSON.parse(localStorage.getItem('userInfo')) || {};
  const MY_SKILLS = user.skills || []; 

  const fetchData = async () => {
    setLoading(true);
    try {
      // --- 2. THE FIX: USE 'api' ---
      const jobRes = await api.get('/api/jobs');
      if (jobRes.data.success) setJobs(jobRes.data.data);
      if (account) {
        const appRes = await api.get(`/api/jobs/applications/${account}`);
        if (appRes.data.success) setApplications(appRes.data.data);
      }
    } catch (error) { console.error("Data Fetch Error:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [account]);

  const handleDeleteJob = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Delete this Job Post? (Test feature)")) {
        // --- 3. THE FIX: USE 'api' ---
        await api.delete(`/api/jobs/${id}`);
        fetchData();
    }
  }

  const handleDeleteApp = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Remove application?")) {
        // --- 4. THE FIX: USE 'api' ---
        await api.delete(`/api/jobs/application/${id}`);
        fetchData();
    }
  }

  const getMatchCount = (jobSkills) => {
    if (!jobSkills || jobSkills.length === 0 || MY_SKILLS.length === 0) return 0;
    const mySkillsLower = MY_SKILLS.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    return jobSkillsLower.filter(skill => mySkillsLower.includes(skill)).length;
  };

  const getMatchPercentage = (jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return 0;
    return Math.round((getMatchCount(jobSkills) / jobSkills.length) * 100);
  };

  const getSortedJobs = () => {
    let relevantJobs = jobs.filter(job => getMatchCount(job.skills) >= 2);
    return relevantJobs.sort((a, b) => {
        if (sortBy === 'match') return getMatchPercentage(b.skills) - getMatchPercentage(a.skills);
        return new Date(a.deadline) - new Date(b.deadline); 
    });
  };

  // --- UI COMPONENTS (No Changes) ---
  
  const JobCard = ({ job, isRecommended }) => {
    const score = getMatchPercentage(job.skills);
    const deadlineDate = new Date(job.deadline);
    const today = new Date();
    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft = diffTime > 0 ? diffTime : 0;

    return (
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        
        {isRecommended && (
          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: score > 60 ? '#dcfce7' : '#fef9c3', color: score > 60 ? '#15803d' : '#854d0e', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderBottomLeftRadius: '12px' }}>
            {score}% MATCH
          </div>
        )}

        <button onClick={(e) => handleDeleteJob(e, job._id)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Trash2 size={16} /></button>
        
        <div style={{ paddingLeft: '25px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{job.title}</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.company} • {job.location}</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
          {job.skills.map((skill) => (
             <span key={skill} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', backgroundColor: MY_SKILLS.some(s=>s.toLowerCase() === skill.toLowerCase()) ? '#dbeafe' : '#f1f5f9', color: '#475569', fontWeight: '500' }}>{skill}</span>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.75rem', color: daysLeft < 3 ? '#ef4444' : '#64748b' }}><Clock size={12} style={{ display:'inline', marginRight:'4px' }} />{daysLeft} Days Left</div>
          
          <span style={{ fontSize: '0.9rem', color: '#14b8a6', fontWeight: 'bold', marginRight: '15px' }}>{job.salary}</span>
          
          <button 
            onClick={() => setSelectedJob(job)} 
            style={{ backgroundColor: job.aiInterviewEnabled ? '#7e22ce' : '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {job.aiInterviewEnabled ? <><Zap size={14} style={{marginRight:'5px'}}/> View & Interview</> : "View & Apply"}
          </button>
        </div>
      </div>
    );
  };

  const AppliedCard = ({ app }) => {
    const job = app.jobId || {}; 
    return (
      <div 
        onClick={() => setSelectedApp(app)} 
        style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}
      >
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>{job.title || "Job Deleted"}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.company}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 'bold' }}>{app.status}</span>
            <button onClick={(e) => handleDeleteApp(e, app._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div style={{ marginBottom: '30px' }}>
            <h1 className="text-3xl font-bold text-slate-800">Job Feed</h1>
            <p className="text-slate-500">Welcome, {user.name || 'Guest'}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
            {['all', 'recommended', 'applied'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ paddingBottom: '10px', background: 'none', border: 'none', color: activeTab === tab ? '#2563eb' : '#64748b', borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none', fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {tab} ({tab === 'applied' ? applications.length : tab === 'recommended' ? getSortedJobs().length : jobs.length})
                </button>
            ))}
        </div>

        {activeTab === 'recommended' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
               <button onClick={() => setSortBy('match')} style={{ marginRight: '10px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: sortBy === 'match' ? '#eff6ff' : 'white', color: sortBy === 'match' ? '#2563eb' : '#64748b' }}>Sort: Skill Match</button>
               <button onClick={() => setSortBy('deadline')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: sortBy === 'deadline' ? '#eff6ff' : 'white', color: sortBy === 'deadline' ? '#2563eb' : '#64748b' }}>Sort: Deadline</button>
            </div>
        )}

        <div className="space-y-4">
          {activeTab === 'all' && jobs.map(job => <JobCard key={job._id} job={job} />)}
          {activeTab === 'recommended' && getSortedJobs().map(job => <JobCard key={job._id} job={job} isRecommended={true} />)}
          {activeTab === 'applied' && applications.map(app => <AppliedCard key={app._id} app={app} />)}
        </div>
        
        {/* MODALS */}
        {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onApplied={() => { alert("Success!"); setSelectedJob(null); fetchData(); setActiveTab('applied'); }} />}
        {selectedApp && <StatusModal application={selectedApp} onClose={() => setSelectedApp(null)} />}
      </div>
    </div>
  );
};

export default SeekerDashboard;