import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// IMPORT REAL PAGES
import Login from './pages/Login';
import ProfileSetup from './pages/seeker/ProfileSetup';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CreateJob from './pages/recruiter/CreateJob';
import ATSView from './pages/recruiter/ATSView';

// GLOBAL LAYOUT (Forces Dark Mode)
const AppLayout = ({ children }) => (
  <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', width: '100%', fontFamily: 'sans-serif' }}>
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
          
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/create-job" element={<CreateJob />} />
          <Route path="/recruiter/ats/:jobId" element={<ATSView />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;