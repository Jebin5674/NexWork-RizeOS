const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <--- CRITICAL IMPORT

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    // 1. Get all possible fields
    const { name, email, password, role, linkedin, github, companyName, currentRole } = req.body;

    try {
        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        // 3. --- MANUAL PASSWORD HASHING (The Fix) ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, // <--- Save the Hashed Password
            role, 
            linkedin, 
            github,
            companyName,
            currentRole
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by their email
        const user = await User.findOne({ email });

        // Check if user exists AND if the password matches
        if (user && (await user.matchPassword(password))) {
            
            // --- THE FIX IS HERE ---
            // When login is successful, include the 'skills' array in the response
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                skills: user.skills, // <--- ADD THIS LINE
                token: generateToken(user._id)
            });

        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser };