const express = require('express');
const router = express.Router();
const { 
    generateVoiceQuestions, 
    evaluateSpokenAnswer, 
    getTechnicalTest, 
    evaluateCode 
} = require('../controllers/aiController');

// Voice Interview Routes
router.post('/generate-voice', generateVoiceQuestions);
router.post('/evaluate-voice', evaluateSpokenAnswer);

// Coding Test Routes
router.post('/get-test', getTechnicalTest);
router.post('/evaluate-code', evaluateCode);

module.exports = router;