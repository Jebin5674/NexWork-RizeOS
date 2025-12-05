const express = require('express');
const router = express.Router();
const multer = require('multer');
const parseResume = require('../utils/resumeParser');

// Setup Memory Storage for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/auth/parse-resume
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

module.exports = router;