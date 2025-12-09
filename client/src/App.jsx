import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// IMPORT REAL PAGES
import Login from './pages/Login';
import ProfileSetup from './pages/seeker/ProfileSetup';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import InterviewRoom from './pages/seeker/InterviewRoom';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CreateJob from './pages/recruiter/CreateJob';
import ATSView from './pages/recruiter/ATSView';

// --- NEW GLOBAL LAYOUT (LIGHT MODE) ---
const AppLayout = ({ children }) => (
  <div style={{ 
    backgroundColor: '#f8fafc', // Soft Light Gray (Premium feel)
    color: '#0f172a',           // Dark Navy Text (High Contrast)
    minHeight: '100vh', 
    width: '100%', 
    fontFamily: '"Inter", "Segoe UI", sans-serif' 
  }}>
    {children}
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/seeker/setup" element={<ProfileSetup />} />
          <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
          <Route path="/seeker/interview" element={<InterviewRoom />} />
          
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/create-job" element={<CreateJob />} />
          <Route path="/recruiter/ats/:jobId" element={<ATSView />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;