const Job = require('../models/Job');

// @desc    Post a new job
// @route   POST /api/jobs
const createJob = async (req, res) => {
    try {
        // --- THE FIX: ADD testConfig HERE ---
        const { title, company, location, description, salary, deadline, skills, walletAddress, txHash, aiInterviewEnabled, recruiterEmail, testConfig } = req.body;

        const isPaid = !!txHash; 

        const job = await Job.create({
            title,
            company,
            location,
            description,
            salary,
            deadline,
            skills,
            walletAddress,
            txHash,
            isPaid,
            aiInterviewEnabled,
            recruiterEmail,
            testConfig // <--- AND SAVE IT HERE
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// --- REST OF THE FILE IS UNCHANGED ---

// @desc    Get all paid jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isPaid: true }).sort({ createdAt: -1 });
        res.json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc Delete a job
const deleteJob = async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

module.exports = { createJob, getJobs, deleteJob };