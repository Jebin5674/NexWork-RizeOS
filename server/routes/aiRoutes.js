const express = require('express');
const router = express.Router();
const { getTechnicalTest, evaluateCode } = require('../controllers/aiController');

// Coding Test Routes
router.post('/get-test', getTechnicalTest);
router.post('/evaluate-code', evaluateCode);

module.exports = router;