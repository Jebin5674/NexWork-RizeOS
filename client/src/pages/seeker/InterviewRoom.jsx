import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Volume2, ArrowRight, Home } from 'lucide-react';
import axios from 'axios';
import { Web3Context } from '../../context/Web3Context';

const InterviewRoom = () => {
  const { account } = useContext(Web3Context);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safety Access to Job Data
  const job = location.state?.job;

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewState, setInterviewState] = useState('loading'); // loading, ready, speaking_q, listening_a

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // --- 1. SAFETY CHECK (Fixes Blank Screen) ---
  useEffect(() => {
    if (!job) {
        // If user refreshed the page, job data is lost.
        // Show error instead of blank screen.
        setInterviewState('error');
    } else {
        // Start generating questions
        generateQuestions();
    }
  }, [job]);

  const generateQuestions = async () => {
    try {
        console.log("Requesting Questions...");
        const res = await axios.post('http://localhost:5000/api/ai/generate', {
            jobTitle: job.title,
            skills: job.skills
        });
        if (res.data.success) {
            setQuestions(res.data.questions);
            setInterviewState('ready');
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("Failed to load AI Interviewer.");
        navigate('/seeker/dashboard');
    }
  };

  // --- 2. TEXT TO SPEECH ---
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
        setInterviewState('listening_a');
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
    };
    window.speechSynthesis.speak(utterance);
  };

  const startQuestion = () => {
    setInterviewState('speaking_q');
    speakText(questions[currentQIndex]);
  };

  // --- 3. SUBMIT ANSWER ---
  const handleSubmitAnswer = async () => {
    SpeechRecognition.stopListening();
    setIsProcessing(true);

    const answer = transcript || "No answer provided";
    
    try {
        const res = await axios.post('http://localhost:5000/api/ai/evaluate', {
            question: questions[currentQIndex],
            userAnswer: answer
        });

        const newScores = [...scores, res.data.score];
        setScores(newScores);

        if (currentQIndex + 1 < questions.length) {
            setCurrentQIndex(prev => prev + 1);
            setInterviewState('ready');
        } else {
            finishInterview(newScores);
        }
    } catch (error) {
        alert("Error evaluating answer");
    } finally {
        setIsProcessing(false);
    }
  };

  const finishInterview = async (finalScores) => {
    const avg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const passed = avg >= 6;

    if (passed) {
        await axios.post('http://localhost:5000/api/jobs/apply', {
            jobId: job._id,
            applicantWallet: account,
            interviewScore: Math.round(avg * 10)
        });
        alert(`🎉 Passed! Score: ${Math.round(avg * 10)}%. Application Submitted.`);
    } else {
        alert(`❌ Failed. Score: ${Math.round(avg * 10)}%. Try again later.`);
    }
    navigate('/seeker/dashboard');
  };

  // --- RENDER ---
  if (!browserSupportsSpeechRecognition) return <div className="text-white p-10">Browser not supported. Use Chrome.</div>;

  if (interviewState === 'error') {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl font-bold mb-4">⚠️ No Job Selected</h1>
            <p className="text-gray-400 mb-6">Please go back to the dashboard and click "Apply" again.</p>
            <button onClick={() => navigate('/seeker/dashboard')} className="bg-blue-600 px-6 py-2 rounded-lg flex items-center">
                <Home className="mr-2"/> Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative">
        <div className="z-10 w-full max-w-3xl text-center">
            
            <h2 className="text-gray-400 uppercase tracking-widest mb-2">AI Interview Room</h2>
            <h1 className="text-3xl font-bold mb-10 text-white">{job?.title}</h1>

            <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-10 min-h-[400px] flex flex-col items-center justify-center">
                
                {interviewState === 'loading' && <div className="animate-pulse text-xl text-blue-400">⚡ Generating Questions...</div>}

                {interviewState === 'ready' && (
                    <div className="text-center">
                        <Volume2 className="w-16 h-16 text-blue-500 mx-auto mb-6"/>
                        <h3 className="text-2xl font-bold mb-4">Question {currentQIndex + 1} of {questions.length}</h3>
                        <button onClick={startQuestion} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200">
                            Start Question
                        </button>
                    </div>
                )}

                {interviewState === 'speaking_q' && (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">AI is Speaking...</h3>
                        <p className="text-xl">"{questions[currentQIndex]}"</p>
                    </div>
                )}

                {interviewState === 'listening_a' && (
                    <div className="w-full">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Mic className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-gray-200 text-lg mb-8 min-h-[60px] bg-slate-800 p-4 rounded-lg">
                            {transcript || "Listening..."}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={SpeechRecognition.stopListening} className="px-6 py-2 bg-slate-700 rounded-lg text-sm">Stop Mic</button>
                            <button onClick={handleSubmitAnswer} disabled={isProcessing} className="px-8 py-2 bg-green-600 rounded-lg font-bold">
                                {isProcessing ? "Analyzing..." : "Submit Answer"}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default InterviewRoom;