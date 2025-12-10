const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Keep this for the matchPassword method

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['seeker', 'recruiter'], required: true },
    
    // Optional Fields
    linkedin: { type: String, default: "" }, 
    github: { type: String, default: "" },
    companyName: { type: String, default: "" },
    currentRole: { type: String, default: "" },
    
    // System Fields
    skills: [{ type: String }],
    walletAddress: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Helper to check password during Login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);