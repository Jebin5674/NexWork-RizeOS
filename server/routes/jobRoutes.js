const express = require('express');
const router = express.Router();
const { createJob, getJobs, deleteJob } = require('../controllers/jobController');
const Application = require('../models/Application');

// --- JOB ROUTES ---
router.post('/', createJob);
router.get('/', getJobs);
router.delete('/:id', deleteJob);

// --- APPLICATION ROUTES ---

// 1. APPLY TO A JOB (FIXED)
router.post('/apply', async (req, res) => {
    try {
        const { jobId, applicantWallet, interviewScore, status } = req.body;
        
        const exists = await Application.findOne({ jobId, applicantWallet });
        if(exists) {
            // If they already applied, just return the existing ID so they can continue
            return res.json({ success: true, applicationId: exists._id });
        }

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
        console.error("Apply Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// 2. GET MY APPLICATIONS
router.get('/applications/:wallet', async (req, res) => {
    try {
        const apps = await Application.find({ applicantWallet: req.params.wallet }).populate('jobId').sort({ appliedAt: -1 });
        res.json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// 3. GET CANDIDATES FOR A JOB
router.get('/candidates/:jobId', async (req, res) => {
    try {
        const apps = await Application.find({ jobId: req.params.jobId });
        res.json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// 4. UPDATE STATUS
router.put('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Application.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// 5. DELETE APPLICATION
router.delete('/application/:id', async (req, res) => {
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;