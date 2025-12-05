import React, { useState, useContext } from 'react';
import { Upload, Wallet, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { Web3Context } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileSetup = () => {
  const { connectWallet, account } = useContext(Web3Context);
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);

  // 1. Handle File Selection & Auto-Parsing
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      setParsing(true);
      const formData = new FormData();
      formData.append('resume', selectedFile);

      try {
        // Send to Backend
        const res = await axios.post('http://localhost:5000/api/auth/parse-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSkills(res.data.skills); // Auto-fill skills
      } catch (error) {
        console.error("Parsing Error", error);
        alert("Failed to parse resume. Please try again.");
      } finally {
        setParsing(false);
      }
    }
  };

  // 2. Submit Profile
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!account) return alert("Please connect your wallet first!");
    
    // In a real app, we save this to MongoDB here
    // For now, we simulate success
    navigate('/seeker/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        
        <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-gray-400 mb-8">Upload your resume to auto-fill skills and connect your Web3 identity.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* STEP 1: RESUME UPLOAD */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">1. Upload Resume (PDF)</label>
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors relative">
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                {parsing ? (
                  <Loader className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                ) : (
                  <Upload className="w-10 h-10 text-blue-500 mb-2" />
                )}
                <span className="text-lg font-medium">
                  {file ? file.name : "Drop your resume here"}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  {parsing ? "AI is extracting skills..." : "We will extract your skills automatically"}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: SKILLS DISPLAY */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Extracted Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CONNECT WALLET */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">2. Web3 Identity</label>
            <div className="p-4 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-700">
              <div className="flex items-center">
                <div className="p-2 bg-teal-500/10 rounded-lg mr-4">
                  <Wallet className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-medium">MetaMask Wallet</h4>
                  <p className="text-sm text-gray-400">
                    {account ? `Connected: ${account.slice(0,6)}...${account.slice(-4)}` : "Not connected"}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={connectWallet}
                disabled={!!account}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  account 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {account ? "Connected" : "Connect"}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg shadow-blue-900/20"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;