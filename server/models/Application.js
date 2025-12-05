const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicantWallet: { type: String, required: true },
    status: { type: String, default: 'Applied' }, // Applied, ATS, HR, Hired
    interviewScore: { type: Number, default: 0 },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);