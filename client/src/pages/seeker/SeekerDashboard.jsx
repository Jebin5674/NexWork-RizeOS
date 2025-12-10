import React, { useState, useEffect, useContext } from 'react';
import { Search, Clock, Zap, Filter, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

  // --- 1. GET REAL USER SKILLS FROM DB ---
  const user = JSON.parse(localStorage.getItem('userInfo')) || {};
  const MY_SKILLS = user.skills || []; // Extracted from Resume

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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [account]);

  const handleDeleteApp = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Remove application?")) {
        await axios.delete(`http://localhost:5000/api/jobs/application/${id}`);
        fetchData();
    }
  }

  // --- REAL MATCHING LOGIC (UPDATED) ---
  
  // Helper to count how many skills match
  const getMatchCount = (jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return 0;
    if (MY_SKILLS.length === 0) return 0;

    const mySkillsLower = MY_SKILLS.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    // Count how many job skills exist in my skills
    return jobSkillsLower.filter(skill => mySkillsLower.includes(skill)).length;
  };

  // Helper to calculate percentage for display
  const getMatchPercentage = (jobSkills) => {
    if (jobSkills.length === 0) return 0;
    const count = getMatchCount(jobSkills);
    return Math.round((count / jobSkills.length) * 100);
  };

  const getSortedJobs = () => {
    // CONDITION: Show job ONLY if at least 2 skills match
    let relevantJobs = jobs.filter(job => getMatchCount(job.skills) >= 2);
    
    return relevantJobs.sort((a, b) => {
        if (sortBy === 'match') return getMatchPercentage(b.skills) - getMatchPercentage(a.skills);
        return new Date(a.deadline) - new Date(b.deadline); 
    });
  };

  // --- WHITE THEME COMPONENTS ---
  
  const JobCard = ({ job, isRecommended }) => {
    const score = getMatchPercentage(job.skills);
    
    // Calculate Days Left
    const deadlineDate = new Date(job.deadline);
    const today = new Date();
    const diffTime = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const daysLeft = diffTime > 0 ? diffTime : 0;

    return (
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        
        {/* Match Badge */}
        {isRecommended && (
          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: score > 60 ? '#dcfce7' : '#fef9c3', color: score > 60 ? '#15803d' : '#854d0e', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderBottomLeftRadius: '12px', borderLeft: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
            {score}% MATCH
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{job.title}</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.company} • {job.location}</p>
        </div>
        
        {/* Skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
          {job.skills.map((skill, index) => {
             // Highlight matching skills
             const isMatch = MY_SKILLS.some(s => s.toLowerCase() === skill.toLowerCase());
             return (
                <span key={index} style={{ 
                    fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', 
                    backgroundColor: isMatch ? '#dbeafe' : '#f1f5f9', 
                    color: isMatch ? '#1e40af' : '#475569', 
                    fontWeight: '500',
                    border: isMatch ? '1px solid #bfdbfe' : 'none'
                }}>
                    {skill}
                </span>
             )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: daysLeft < 3 ? '#ef4444' : '#64748b', fontWeight: daysLeft < 3 ? 'bold' : 'normal' }}>
            <Clock size={12} style={{ marginRight: '4px' }} /> {daysLeft} Days Left
          </div>
          <span style={{ fontSize: '0.9rem', color: '#2dd4bf', fontWeight: 'bold', marginLeft:'auto', marginRight:'15px' }}>{job.salary}</span>
          
          <button onClick={() => setSelectedJob(job)} style={{ backgroundColor: job.aiInterviewEnabled ? '#7e22ce' : '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {job.aiInterviewEnabled ? <><Zap size={14} style={{marginRight:'5px'}}/> View & Interview</> : "Apply Now"}
          </button>
        </div>
      </div>
    );
  };

  const AppliedCard = ({ app }) => {
    const job = app.jobId || {}; 
    const isExpanded = expandedAppId === app._id;
    return (
      <div onClick={() => setExpandedAppId(isExpanded ? null : app._id)} style={{ backgroundColor: 'white', border: isExpanded ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1rem', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>{job.title || "Job Deleted"}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.company}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 'bold' }}>{app.status}</span>
                <button onClick={(e) => handleDeleteApp(e, app._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                {isExpanded ? <ChevronUp size={20} color="#94a3b8"/> : <ChevronDown size={20} color="#94a3b8"/>}
            </div>
        </div>
        {isExpanded && (
            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '10px' }}>STATUS PIPELINE</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['ATS', 'HR', 'Manager'].map(stage => (
                        <div key={stage} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', backgroundColor: app.status === stage ? '#dbeafe' : 'white', border: '1px solid #e2e8f0', color: app.status === stage ? '#1d4ed8' : '#cbd5e1', fontWeight: 'bold', fontSize: '0.8rem' }}>{stage}</div>
                    ))}
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div><h1 className="text-3xl font-bold text-slate-800">Job Feed</h1><p className="text-slate-500">Welcome, {account ? `${account.slice(0,6)}...` : 'Guest'}</p></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
          {['recommended', 'all', 'applied'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ paddingBottom: '10px', background: 'none', border: 'none', color: activeTab === tab ? '#2563eb' : '#64748b', borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer', marginBottom: '-2px' }}>{tab}</button>
          ))}
        </div>
        {activeTab === 'recommended' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
               <button onClick={() => setSortBy('match')} style={{ marginRight: '10px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: sortBy === 'match' ? '#eff6ff' : 'white', color: sortBy === 'match' ? '#2563eb' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Sort: Skill Match</button>
               <button onClick={() => setSortBy('deadline')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: sortBy === 'deadline' ? '#eff6ff' : 'white', color: sortBy === 'deadline' ? '#2563eb' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Sort: Deadline</button>
            </div>
        )}
        <div className="space-y-4">
          {activeTab === 'recommended' && getSortedJobs().map(job => <JobCard key={job._id} job={job} isRecommended={true} />)}
          {activeTab === 'all' && jobs.map(job => <JobCard key={job._id} job={job} />)}
          {activeTab === 'applied' && applications.map(app => <AppliedCard key={app._id} app={app} />)}
        </div>
        {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onApplied={() => { alert("Success!"); setSelectedJob(null); fetchData(); setActiveTab('applied'); }} />}
      </div>
    </div>
  );
};

export default SeekerDashboard;