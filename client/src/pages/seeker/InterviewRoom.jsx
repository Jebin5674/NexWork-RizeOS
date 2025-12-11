import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Volume2, Code, ArrowRight, Home, Loader } from 'lucide-react';
import api from 'src/api';
import { Web3Context } from '../../context/Web3Context';

const InterviewRoom = () => {
  const { account } = useContext(Web3Context);
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;

  // --- State ---
  const [phase, setPhase] = useState('voice');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [voiceScores, setVoiceScores] = useState([]);
  const [codeScores, setCodeScores] = useState([]);
  const [userCode, setUserCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uiState, setUiState] = useState('loading');
  const [applicationId, setApplicationId] = useState(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // --- 1. INITIALIZE ---
  useEffect(() => {
    if (!job || !account) { setUiState('error'); return; }
    
    const initializeInterview = async () => {
      try {
        const appRes = await api.post('/api/jobs/apply', { jobId: job._id, applicantWallet: account, status: 'Applied' });
        if (appRes.data.success) {
            setApplicationId(appRes.data.applicationId);
        } else {
            alert("Application Error: " + appRes.data.message);
            navigate('/seeker/dashboard');
            return;
        }
        
        const voiceRes = await api.post('/api/ai/generate-voice', { jobTitle: job.title, skills: job.skills });
        if (voiceRes.data.success) {
            setQuestions(voiceRes.data.questions);
            setUiState('ready');
        }
      } catch (error) {
        alert("Failed to initialize interview: " + (error.response?.data?.message || error.message));
        navigate('/seeker/dashboard');
      }
    };
    initializeInterview();
  }, [job, account]);
  
  // Helper to update status automatically
  const updateStatus = async (status) => {
    if (!applicationId) return; // Safety check
    try {
        await api.put(`/api/jobs/status/${applicationId}`, { status });
        console.log(`Status updated to: ${status}`);
    } catch (error) {
        console.error("Status update failed:", error);
    }
  };

  // --- 2. VOICE INTERVIEW ---
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
        setUiState('listening');
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
    };
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceQuestion = () => {
    setUiState('speaking');
    speakText(questions[currentQIndex]);
  };

  const submitVoiceAnswer = async () => {
    SpeechRecognition.stopListening();
    setIsProcessing(true);
    const answer = transcript.length > 5 ? transcript : "No answer"; 

    try {
        // Send to AI Judge to get a score (1 or 0)
        const res = await api.post('/api/ai/evaluate-voice', {
            question: questions[currentQIndex],
            userAnswer: answer
        });
        
        const score = res.data.score || 0;
        const newScores = [...voiceScores, score];
        setVoiceScores(newScores);

        // Check if Voice Phase is Done
        if (currentQIndex + 1 < questions.length) {
            setCurrentQIndex(prev => prev + 1);
            setUiState('ready');
            resetTranscript();
        } else {
            const totalScore = newScores.reduce((a, b) => a + b, 0);
            if (totalScore >= 3) {
                alert("Voice Round Passed! Now for the Coding Challenge.");
                await updateStatus('ATS');
                setPhase('coding');
                setUiState('loading');
                loadCodingTest();
            } else {
                await updateStatus('Rejected');
                alert(`Voice Round Failed. You only scored ${totalScore}/${questions.length}. Application rejected.`);
                navigate('/seeker/dashboard');
            }
        }
    } catch (error) {
        console.error("Evaluation Error:", error);
        // Move next even on error to not block the user
        if (currentQIndex + 1 < questions.length) {
            setCurrentQIndex(prev => prev + 1);
            setUiState('ready');
        } else {
            setPhase('coding');
            setUiState('loading');
            loadCodingTest();
        }
    } finally {
        setIsProcessing(false);
    }
  };
  
  // --- 3. CODING TEST ---
  const loadCodingTest = async () => {
    try {
        const res = await api.post('/api/ai/get-test', { testConfig: job.testConfig || ['easy', 'medium', 'hard'] });
        setQuestions(res.data.questions);
        setCurrentQIndex(0);
        setUiState('ready');
    } catch (error) { alert("Failed to load Coding Test."); }
  };

  const submitCodeAnswer = async () => {
    setIsProcessing(true);
    try {
        const res = await api.post('/api/ai/evaluate-code', { questionTitle: questions[currentQIndex].title, userCode });
        const newScores = [...codeScores, res.data.score];
        setCodeScores(newScores);

        if (currentQIndex + 1 < questions.length) {
            setCurrentQIndex(prev => prev + 1);
            setUserCode("");
            setUiState('ready');
        } else {
            finishInterview(newScores);
        }
    } catch (error) { alert("Error evaluating code."); }
    finally { setIsProcessing(false); }
  };

  // --- 4. FINISH & APPLY ---
  const finishInterview = async (finalCodeScores) => {
    const totalCodeScore = finalCodeScores.reduce((a, b) => a + b, 0);
    const passedCode = totalCodeScore >= 2;

    if (passedCode) {
        const finalScore = Math.round((totalCodeScore / finalCodeScores.length) * 100);
        await updateStatus('HR');
        alert(`🎉 PASSED! You solved ${totalCodeScore}/${finalCodeScores.length} problems.`);
    } else {
        await updateStatus('Rejected');
        alert(`❌ FAILED. You scored ${totalCodeScore}/${finalCodeScores.length}.`);
    }
    navigate('/seeker/dashboard');
  };

  // --- RENDER ---
  if (!browserSupportsSpeechRecognition) {
    return <div className="text-white p-10 bg-slate-900 h-screen">Browser not supported. Use Chrome.</div>;
  }

  if (uiState === 'error' || !job) {
    return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚠️ Session Error</h1>
        <button onClick={() => navigate('/seeker/dashboard')} style={{ background: '#2563eb', padding: '10px 20px', borderRadius: '8px', marginTop: '10px' }}>Dashboard</button>
    </div>;
  }

  const renderContent = () => {
    if (uiState === 'loading') return <Loader className="animate-spin" size={48} />;
    
    if (phase === 'voice') {
      if (uiState === 'ready') return <button onClick={startVoiceQuestion} style={{background:'white', color:'black', padding:'12px 30px', borderRadius:'30px', fontWeight:'bold'}}>Start Voice Question {currentQIndex + 1}</button>;
      if (uiState === 'speaking') return <p style={{fontSize:'1.5rem'}}>"{questions[currentQIndex]}"</p>;
      if (uiState === 'listening') return <div style={{width:'100%'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
              <div style={{width:'80px', height:'80px', borderRadius:'50%', background: listening ? 'rgba(239, 68, 68, 0.2)' : '#334155', display:'flex', alignItems:'center', justifyContent:'center', border: listening ? '2px solid #ef4444' : 'none', transition:'all 0.2s'}}>
                  <Mic size={40} style={{color: listening ? '#ef4444' : '#64748b'}}/>
              </div>
          </div>
          <p style={{minHeight:'60px', background:'#020617', padding:'10px', borderRadius:'8px', border:'1px solid #475569'}}>{transcript || "Listening..."}</p>
          <button onClick={submitVoiceAnswer} disabled={isProcessing} style={{padding:'10px 20px', background:'#16a34a', border:'none', color:'white', borderRadius:'8px', fontWeight:'bold', width:'100%', marginTop:'10px'}}>
            {isProcessing ? "Grading Answer..." : "Submit Answer"}
          </button>
        </div>;
    }
    
    if (phase === 'coding') {
      if (uiState === 'ready') return <button onClick={() => setUiState('coding')} style={{background:'white', color:'black', padding:'12px 30px', borderRadius:'30px', fontWeight:'bold'}}>Start Coding Problem {currentQIndex + 1}</button>;
      if (uiState === 'coding') return <div style={{textAlign:'left', width:'100%'}}>
          <h3 style={{fontSize:'1.2rem', fontWeight:'bold'}}>{questions[currentQIndex]?.title}</h3>
          <p style={{color:'#cbd5e1'}}>{questions[currentQIndex]?.desc}</p>
          <textarea value={userCode} onChange={(e) => setUserCode(e.target.value)} placeholder="// Your solution..." style={{width:'100%', height:'200px', background:'#020617', border:'1px solid #475569', borderRadius:'10px', padding:'15px', color:'white', fontFamily:'monospace'}} />
          <button onClick={submitCodeAnswer} disabled={isProcessing} style={{width:'100%', marginTop:'10px', padding:'15px', background:'#16a34a', border:'none', color:'white', borderRadius:'10px', fontWeight:'bold'}}>
            {isProcessing ? "Judging..." : `Submit & Next`}
          </button>
        </div>;
    }
    return null;
  };

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0f172a', color:'white', padding:'20px'}}>
        <div style={{width:'100%', maxWidth:'900px', textAlign:'center'}}>
            <h1 style={{fontSize:'2.5rem', fontWeight:'800', marginBottom:'10px'}}>{job?.title}</h1>
            <h2 style={{fontSize:'1rem', color: phase === 'voice' ? '#60a5fa' : '#a78bfa', fontWeight:'bold', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'30px'}}>
                {phase === 'voice' ? 'Phase 1: Conceptual Interview (5 Qs)' : 'Phase 2: Coding Challenge (3 Qs)'}
            </h2>
            <div style={{background:'#1e293b', border:'1px solid #334155', borderRadius:'20px', padding:'40px', minHeight:'400px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default InterviewRoom;