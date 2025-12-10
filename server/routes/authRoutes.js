const express = require('express');
const router = express.Router();
const multer = require('multer');
const parseResume = require('../utils/resumeParser');
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/User'); // <--- ADDED THIS IMPORT

// --- AUTH ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- RESUME PARSER ROUTE ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Call our Utility Script
        const result = await parseResume(req.file.buffer);

        if (!result.success) {
            return res.status(500).json({ message: "Failed to parse PDF" });
        }

        // Return the extracted skills to the frontend
        res.json({
            message: "Resume parsed successfully",
            skills: result.skills,
            preview: result.textSnippet
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// --- NEW ROUTE: SAVE PROFILE SKILLS (This was missing!) ---
router.put('/profile', async (req, res) => {
    const { email, skills } = req.body; 
    
    try {
        // Find user by email and update their skills
        const user = await User.findOneAndUpdate(
            { email: email },
            { skills: skills },
            { new: true } // Return the updated user
        );
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;