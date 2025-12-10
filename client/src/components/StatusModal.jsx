import React from 'react';
import { X, CheckCircle, Loader, XCircle, FileText, Code, BrainCircuit, Users, Award } from 'lucide-react';

const StatusModal = ({ application, onClose }) => {
  if (!application) return null;
  const job = application.jobId || {};

  // --- UPDATED LABELS FOR AUTOMATION ---
  const stages = [
    { name: "Application Sent", key: "Applied", icon: <FileText/> },
    { name: "AI Voice Screen", key: "ATS", icon: <BrainCircuit/> },
    { name: "Technical Coding Test", key: "HR", icon: <Code/> },
    { name: "Manager Review", key: "Manager", icon: <Users/> },
    { name: "Offer Extended", key: "Hired", icon: <Award/> }
  ];

  const getStageStatus = (stageKey) => {
    const stageOrder = ["Applied", "ATS", "HR", "Manager", "Hired"];
    const currentIdx = stageOrder.indexOf(application.status);
    const stageIdx = stageOrder.indexOf(stageKey);

    if (application.status === 'Rejected') return 'rejected';
    if (currentIdx > stageIdx) return 'passed';
    if (currentIdx === stageIdx) return 'current';
    return 'pending';
  };
  
  const StageItem = ({ name, icon, status }) => {
    const baseStyle = { display: 'flex', alignItems: 'center', gap: '1rem' };
    const iconBoxStyle = { width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
    const textStyle = { fontWeight: 'bold' };

    let statusStyle = {};
    let statusIcon = icon;

    switch(status) {
        case 'passed':
            statusStyle = { bg: '#dcfce7', text: '#166534' };
            statusIcon = <CheckCircle/>;
            break;
        case 'current':
            statusStyle = { bg: '#dbeafe', text: '#4338ca' };
            statusIcon = <Loader className="animate-spin"/>;
            break;
        case 'rejected':
            statusStyle = { bg: '#fee2e2', text: '#991b1b' };
            statusIcon = <XCircle/>;
            break;
        default: // pending
            statusStyle = { bg: '#f1f5f9', text: '#94a3b8' };
            break;
    }

    return (
        <div style={baseStyle}>
            <div style={{...iconBoxStyle, backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                {React.cloneElement(statusIcon, { size: 24 })}
            </div>
            <div>
                <h4 style={{ ...textStyle, color: status === 'pending' ? '#94a3b8' : '#1e293b' }}>{name}</h4>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: statusStyle.text, margin: 0 }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
            </div>
        </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: 'white', maxWidth: '500px', width: '100%', borderRadius: '16px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X/></button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{job.title}</h2>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>at {job.company}</p>

        {/* VERTICAL TIMELINE */}
        <div style={{ position: 'relative', paddingLeft: '24px' }}>
            <div style={{ position: 'absolute', top: 0, left: '24px', width: '2px', height: '100%', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {stages.map(stage => (
                    <StageItem 
                        key={stage.key}
                        name={stage.name}
                        icon={stage.icon}
                        status={getStageStatus(stage.key)}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;