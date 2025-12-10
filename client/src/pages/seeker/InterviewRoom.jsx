import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'regenerator-runtime/runtime'; // Required for speech recognition
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Volume2, ArrowRight, Home, Loader } from 'lucide-react';
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
  const [interviewState, setInterviewState] = useState('loading'); // loading, ready, speaking_q, listening_a, completed

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // --- 1. SAFETY CHECK (Fixes Blank Screen) ---
  useEffect(() => {
    if (!job) {
        setInterviewState('error');
    } else {
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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
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

    const answer = transcript.length > 2 ? transcript : "No answer provided";
    
    try {
        const res = await axios.post('http://localhost:5000/api/ai/evaluate', {
            question: questions[currentQIndex],
            userAnswer: answer
        });

        // Score will be 1 (Pass) or 0 (Fail)
        const score = res.data.score || 0;
        const newScores = [...scores, score];
        setScores(newScores);

        if (currentQIndex + 1 < questions.length) {
            setCurrentQIndex(prev => prev + 1);
            setInterviewState('ready');
            resetTranscript();
        } else {
            finishInterview(newScores);
        }
    } catch (error) {
        alert("Error evaluating answer. Moving next.");
        setInterviewState('ready');
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 4. FINISH & AUTO-APPLY (Logic: 2/5 to Pass) ---
  const finishInterview = async (finalScores) => {
    // Sum up the 1s
    const totalScore = finalScores.reduce((a, b) => a + b, 0);
    const passed = totalScore >= 2; // Pass if 2 or more correct

    if (passed) {
        try {
            await axios.post('http://localhost:5000/api/jobs/apply', {
                jobId: job._id,
                applicantWallet: account,
                interviewScore: (totalScore * 20) // Convert to percentage (e.g., 3/5 = 60%)
            });
            alert(`🎉 PASSED! \nYou answered ${totalScore}/5 correctly.\n\nApplication Submitted Successfully.`);
        } catch (error) {
            console.error("Apply Error:", error);
            alert(`Passed (${totalScore}/5) but application failed to save.`);
        }
    } else {
        alert(`❌ FAILED. \nYou scored ${totalScore}/5.\n\nYou need at least 2 correct answers to apply.`);
    }
    
    navigate('/seeker/dashboard');
  };

  // --- RENDER ---
  if (!browserSupportsSpeechRecognition) return <div className="text-white p-10 bg-slate-900 h-screen">Browser not supported. Use Chrome.</div>;

  if (interviewState === 'error') {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl font-bold mb-4">⚠️ No Job Selected</h1>
            <p className="text-gray-400 mb-6">Please go back to the dashboard and click "Apply" again.</p>
            <button onClick={() => navigate('/seeker/dashboard')} className="bg-blue-600 px-6 py-2 rounded-lg flex items-center font-bold">
                <Home className="mr-2"/> Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white p-6 z-50">
        
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>

        <div className="z-10 w-full max-w-4xl text-center">
            
            <div className="mb-10">
                <h2 className="text-sm text-teal-400 font-bold uppercase tracking-[0.2em] mb-3">AI Technical Screen</h2>
                <h1 className="text-4xl font-extrabold text-white">{job?.title}</h1>
                
                {/* Progress Bar */}
                <div className="flex justify-center gap-2 mt-4">
                    {questions.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentQIndex ? 'w-12 bg-teal-400' : idx < currentQIndex ? 'w-4 bg-green-500' : 'w-4 bg-slate-700'}`} />
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-12 shadow-2xl min-h-[450px] flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* STATE: LOADING */}
                {interviewState === 'loading' && (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin mb-6"></div>
                        <p className="text-xl text-slate-300 font-light">Analyzing Job Description...</p>
                        <p className="text-sm text-slate-500 mt-2">Generating technical questions via Groq AI</p>
                    </div>
                )}

                {/* STATE: READY */}
                {interviewState === 'ready' && (
                    <div className="text-center animate-fade-in">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/20">
                            <Volume2 className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white">Question {currentQIndex + 1}</h3>
                        <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
                            The AI will read the question aloud. Please wait for it to finish speaking before answering.
                        </p>
                        <button onClick={startQuestion} className="bg-white text-slate-950 px-10 py-4 rounded-full font-bold text-lg hover:bg-teal-50 transition-all transform hover:scale-105 shadow-xl">
                            Start Question
                        </button>
                    </div>
                )}

                {/* STATE: AI SPEAKING */}
                {interviewState === 'speaking_q' && (
                    <div className="text-center">
                        <div className="mb-8">
                            <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30 animate-pulse">
                                AI SPEAKING...
                            </span>
                        </div>
                        <p className="text-2xl text-white font-medium leading-relaxed max-w-2xl mx-auto">
                            "{questions[currentQIndex]}"
                        </p>
                    </div>
                )}

                {/* STATE: USER LISTENING */}
                {interviewState === 'listening_a' && (
                    <div className="w-full max-w-2xl">
                        <div className="flex justify-center mb-8">
                            <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${listening ? 'bg-red-500/20 border-2 border-red-500 animate-pulse' : 'bg-slate-800'}`}>
                                <Mic className={`w-14 h-14 ${listening ? 'text-red-500' : 'text-slate-500'}`} />
                            </div>
                        </div>
                        
                        <div className="bg-black/30 p-6 rounded-xl border border-slate-700/50 min-h-[120px] mb-8 text-left relative">
                            <p className="text-xl text-slate-200">
                                {transcript || <span className="text-slate-600 italic">Listening for your answer...</span>}
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={SpeechRecognition.stopListening} 
                                className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                            >
                                Stop Mic
                            </button>
                            <button 
                                onClick={handleSubmitAnswer} 
                                disabled={isProcessing}
                                className="px-10 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all flex items-center shadow-lg shadow-teal-900/20"
                            >
                                {isProcessing ? <><Loader className="animate-spin mr-2"/> Grading...</> : <>Submit Answer <ArrowRight className="ml-2 w-5 h-5"/></>}
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