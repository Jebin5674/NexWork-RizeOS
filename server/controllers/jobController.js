const Job = require('../models/Job');

// @desc    Post a new job
// @route   POST /api/jobs
const createJob = async (req, res) => {
    try {
        // ADD recruiterEmail to the list of variables we accept
        const { title, company, location, description, salary, deadline, skills, walletAddress, txHash, aiInterviewEnabled, recruiterEmail } = req.body;

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
            recruiterEmail // <--- SAVE IT
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Get all paid jobs (For the Feed)
// @route   GET /api/jobs
const getJobs = async (req, res) => {
    try {
        // Only fetch jobs that are PAID
        const jobs = await Job.find({ isPaid: true }).sort({ createdAt: -1 });
        res.json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc Delete a job
// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// UPDATE EXPORTS
module.exports = { createJob, getJobs, deleteJob };