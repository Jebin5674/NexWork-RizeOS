const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: String, required: true },
    deadline: { type: Date, required: true },
    skills: [{ type: String }], 
    
    // --- IDENTITY FIELDS ---
    walletAddress: { type: String, required: true }, // The Payer
    recruiterEmail: { type: String }, // <--- NEW: The Account Holder
    
    isPaid: { type: Boolean, default: false },
    txHash: { type: String },
    aiInterviewEnabled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);