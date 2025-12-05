import React, { useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { Wallet, Sparkles, X, Loader } from 'lucide-react';

const CreateJob = () => {
  const { account, connectWallet } = useContext(Web3Context);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', salary: '',
    description: '', deadline: '', aiEnabled: false
  });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- HANDLERS ---
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput) {
      e.preventDefault();
      if (!skills.includes(skillInput)) {
        setSkills([...skills, skillInput]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- THE BIG ONE: PAYMENT & POST ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!account) return alert("Please connect wallet first!");
    
    setLoading(true);

    try {
      // --- STEP 1: BLOCKCHAIN PAYMENT ---
      console.log("Step 1: Starting Payment...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // REPLACE WITH YOUR ADMIN ADDRESS
      const ADMIN_ADDRESS = "0xcD7fA151d4077E49ed73236B87a583825887131a"; 
      
      const tx = await signer.sendTransaction({
        to: ADMIN_ADDRESS,
        value: ethers.parseEther("0.00001")
      });

      console.log("Tx Hash:", tx.hash);
      await tx.wait(); // Wait for mining
      console.log("Step 1: Payment Confirmed on Blockchain!");

      // --- STEP 2: DATABASE SAVE ---
      console.log("Step 2: Saving to Database...");
      
      const jobPayload = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        salary: formData.salary,
        deadline: formData.deadline,
        skills: skills,
        walletAddress: account,
        txHash: tx.hash,
        isPaid: true,
        aiInterviewEnabled: formData.aiEnabled
      };

      const res = await axios.post('http://localhost:5000/api/jobs', jobPayload);
      console.log("Step 2: Database Response:", res.data);
      
      alert("Job Posted Successfully!");
      navigate('/recruiter/dashboard');

    } catch (error) {
      console.error("CRITICAL ERROR:", error);

      // Check where it failed
      if (error.response) {
        // This means the SERVER rejected it
        alert(`Server Error: ${error.response.data.error || "Unknown Server Error"}`);
        console.log("Server Error Details:", error.response.data);
      } else if (error.code === "ACTION_REJECTED") {
        // This means User clicked "Reject" in MetaMask
        alert("Transaction rejected by user.");
      } else {
        // Other errors
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl">
        
        <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
        
        <form onSubmit={handlePostJob} className="space-y-6">
          
          {/* BASICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Job Title</label>
              <input name="title" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none" placeholder="e.g. Senior React Dev" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Company Name</label>
              <input name="company" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none" placeholder="e.g. TechCorp" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location</label>
              <input name="location" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none" placeholder="Remote / NY" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Budget / Salary</label>
              <input name="salary" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none" placeholder="e.g. 3.5 ETH / $120k" />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Job Description</label>
            <textarea name="description" required onChange={handleChange} rows="4" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none" placeholder="Describe the role..." />
          </div>

          {/* SKILLS TAGS */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Required Skills (Press Enter to add)</label>
            <input 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none" 
              placeholder="Type skill & hit Enter (e.g. React)" 
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map(skill => (
                <span key={skill} className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm flex items-center">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-white"><X className="w-3 h-3"/></button>
                </span>
              ))}
            </div>
          </div>

          {/* AI TOGGLE */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <h4 className="font-bold flex items-center text-teal-400"><Sparkles className="w-4 h-4 mr-2"/> Enable AI Interviewer?</h4>
              <p className="text-xs text-gray-500">Candidates must pass an AI voice interview to apply.</p>
            </div>
            <input 
              type="checkbox" 
              name="aiEnabled" 
              onChange={handleChange}
              className="w-6 h-6 accent-teal-500 cursor-pointer"
            />
          </div>

          {/* DEADLINE */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Application Deadline</label>
            <input type="date" name="deadline" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-teal-500 outline-none text-white" />
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg ${
              loading ? 'bg-slate-700 cursor-wait' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-900/20'
            }`}
          >
            {loading ? (
              <><Loader className="w-5 h-5 animate-spin mr-2" /> Processing Payment...</>
            ) : (
              <><Wallet className="w-5 h-5 mr-2" /> Pay 0.001 ETH & Post Job</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateJob;