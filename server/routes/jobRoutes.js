const express = require('express');
const router = express.Router();
const { createJob, getJobs, deleteJob } = require('../controllers/jobController');
const Application = require('../models/Application'); // Ensure this model exists

// --- JOB ROUTES ---
router.post('/', createJob);
router.get('/', getJobs);
router.delete('/:id', deleteJob);

// --- APPLICATION ROUTES ---

// 1. Apply to a Job
// NEW FIXED CODE
router.post('/apply', async (req, res) => {
    try {
        const { jobId, applicantWallet, interviewScore, status } = req.body;
        
        const exists = await Application.findOne({ jobId, applicantWallet });
        if(exists) return res.status(400).json({ success: false, message: "Already applied" });

        // Create the new application
        const newApplication = await Application.create({ 
            jobId, 
            applicantWallet, 
            interviewScore,
            status 
        });

        // --- THE FIX: Return the ID of the new application ---
        res.json({ success: true, applicationId: newApplication._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// 2. Get My Applications (For Seeker Dashboard)
router.get('/applications/:wallet', async (req, res) => {
    try {
        // Find apps where applicantWallet matches
        // .populate('jobId') fills in the Title/Company details from the Job collection
        const apps = await Application.find({ applicantWallet: req.params.wallet })
            .populate('jobId')
            .sort({ appliedAt: -1 });
            
        res.json({ success: true, data: apps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// 3. Get Candidates for a Job (For Recruiter ATS)
router.get('/candidates/:jobId', async (req, res) => {
    try {
        const apps = await Application.find({ jobId: req.params.jobId });
        res.json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// 4. Update Application Status (For Recruiter Actions)
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body; // e.g. "HR_ROUND", "HIRED"
        await Application.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// 5. Delete an Application (For Seeker to remove rejected ones)
router.delete('/application/:id', async (req, res) => {
    try {
        const Application = require('../models/Application');
        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;