import React, { useState, useContext } from 'react';
import { Upload, Wallet, ArrowRight, Loader } from 'lucide-react';
import { Web3Context } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // <-- 1. IMPORT THE API HELPER

const ProfileSetup = () => {
  const { connectWallet, account } = useContext(Web3Context);
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [parsing, setParsing] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setParsing(true);
      const formData = new FormData();
      formData.append('resume', selectedFile);
      try {
        // --- 2. THE FIX: USE 'api' ---
        const res = await api.post('/api/auth/parse-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSkills(res.data.skills);
      } catch (error) {
        console.error(error);
        alert("Failed to parse resume.");
      } finally {
        setParsing(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return alert("Please connect your wallet first!");
    
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (!user) {
        alert("Session expired. Please login again.");
        navigate('/login');
        return;
    }

    try {
        // --- 3. THE FIX: USE 'api' ---
        const res = await api.put('/api/auth/profile', {
            email: user.email,
            skills: skills
        });

        if(res.data.success) {
            const updatedUser = { ...user, skills: res.data.user.skills };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            navigate('/seeker/dashboard');
        }
    } catch (error) {
        console.error("Save Error:", error);
        alert("Failed to save profile. Try again.");
    }
  };

  // --- UI (No Changes) ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
        
        <h2 className="text-3xl font-bold mb-2 text-slate-800">Complete Your Profile</h2>
        <p className="text-slate-500 mb-8">Upload your resume to auto-fill skills and connect your Web3 identity.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Upload Resume (PDF)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors relative">
              <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center">
                {parsing ? <Loader className="w-10 h-10 text-blue-600 animate-spin mb-2" /> : <Upload className="w-10 h-10 text-blue-600 mb-2" />}
                <span className="text-lg font-medium text-slate-700">{file ? file.name : "Drop your resume here"}</span>
                <span className="text-sm text-slate-500 mt-1">{parsing ? "AI is reading..." : "AI Auto-Extraction"}</span>
              </div>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Web3 Identity</label>
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg mr-4 border border-slate-200 shadow-sm"><Wallet className="w-6 h-6 text-teal-600" /></div>
                <div>
                  <h4 className="font-bold text-slate-800">MetaMask Wallet</h4>
                  <p className="text-sm text-slate-500">{account ? `Connected: ${account.slice(0,6)}...` : "Not connected"}</p>
                </div>
              </div>
              <button type="button" onClick={connectWallet} disabled={!!account} className={`px-4 py-2 rounded-lg font-bold transition-all ${account ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'}`}>
                {account ? "Connected" : "Connect"}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg shadow-blue-200">
            Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;