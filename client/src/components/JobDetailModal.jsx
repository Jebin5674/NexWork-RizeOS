import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, CheckCircle, Briefcase } from 'lucide-react';
import { Web3Context } from '../context/Web3Context';
import api from '../api'; // <-- 1. IMPORT THE API HELPER

const JobDetailModal = ({ job, onClose, onApplied }) => {
  const { account } = useContext(Web3Context);
  const navigate = useNavigate();
  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(false);

  // Simple Apply (For jobs without AI Interview)
  const handleApply = async (score = 0) => {
    if(!account) return alert("Connect Wallet first!");
    setLoading(true);
    
    try {
        // --- 2. THE FIX: USE 'api' ---
        await api.post('/api/jobs/apply', {
            jobId: job._id,
            applicantWallet: account,
            interviewScore: score,
            status: 'Applied'
        });
        setStep('success');
        onApplied(); // Refresh dashboard
    } catch (error) {
        alert("Application failed: " + (error.response?.data?.message || "Server Error"));
    } finally {
        setLoading(false);
    }
  };

  // Start AI Interview (Redirects to room)
  const startInterview = () => {
    navigate('/seeker/interview', { state: { job: job } });
  };

  if (!job) return null;

  // --- UI (No Changes) ---
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        {step === 'details' && (
            <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1">{job.title}</h2>
                        <p className="text-teal-400 text-lg">{job.company} • {job.location}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{job.salary}</div>
                        <div className="text-sm text-gray-400">Budget</div>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{job.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {job.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-900/30 text-blue-300 border border-blue-500/30 rounded-full text-sm">
                            {s}
                        </span>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-800">
                    {job.aiInterviewEnabled ? (
                        <button 
                            onClick={startInterview}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg flex items-center justify-center"
                        >
                            <Zap className="w-5 h-5 mr-2" /> Start AI Interview & Apply
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleApply(0)}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center"
                        >
                            {loading ? "Applying..." : "Easy Apply Now"}
                        </button>
                    )}
                </div>
            </div>
        )}

        {step === 'success' && (
            <div className="p-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Application Sent!</h2>
                <p className="text-gray-400 mb-8">Check the "Applied" tab to track your status.</p>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium">Close</button>
            </div>
        )}

      </div>
    </div>
  );
};

export default JobDetailModal;