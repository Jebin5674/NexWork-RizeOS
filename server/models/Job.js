const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: String, required: true }, // e.g. "0.5 ETH"
    deadline: { type: Date, required: true },
    
    // The "Brain" of the app
    skills: [{ type: String }], 
    
    // Web3 / Payment Stuff
    walletAddress: { type: String, required: true }, // Who posted it?
    isPaid: { type: Boolean, default: false },       // Did they pay the fee?
    txHash: { type: String },                        // Proof of payment
    
    // Features
    aiInterviewEnabled: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);