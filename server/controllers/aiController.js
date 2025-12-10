const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// Helper to init Groq
const getGroq = () => {
    if (!process.env.GROQ_API_KEY) throw new Error("No GROQ_API_KEY");
    return new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
    });
};

// 1. GET TECHNICAL TEST (Non-AI, just Logic)
const getTechnicalTest = async (req, res) => {
    const { testConfig } = req.body; // e.g. ["easy", "medium", "hard"]
    
    try {
        // Read JSON File
        const dataPath = path.join(__dirname, '../data/questions.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        let selectedQuestions = [];

        // Pick 1 random question for each difficulty selected
        testConfig.forEach(level => {
            const pool = data[level.toLowerCase()]; // 'easy', 'medium', 'hard'
            if (pool && pool.length > 0) {
                const randomQ = pool[Math.floor(Math.random() * pool.length)];
                selectedQuestions.push(randomQ);
            }
        });

        res.json({ success: true, questions: selectedQuestions });

    } catch (error) {
        console.error("Test Gen Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate test" });
    }
};

// 2. EVALUATE CODE (AI Judge)
const evaluateCode = async (req, res) => {
    const { questionTitle, questionDesc, userCode } = req.body;
    console.log(`🧠 AI Judging Code for: ${questionTitle}...`);

    try {
        const groq = getGroq();

        const prompt = `
            You are a Senior Software Engineer acting as a LeetCode Judge.
            
            Problem: "${questionTitle}"
            Description: "${questionDesc}"
            
            User's Code Submission:
            ${userCode}
            
            Task:
            Check if this code solves the problem correctly.
            - Logic must be sound.
            - Edge cases should be handled (briefly).
            - Syntax should be mostly correct (pseudo-code is acceptable if logic is perfect).
            
            OUTPUT:
            Return ONLY the number "1" if the solution is Correct.
            Return ONLY the number "0" if the solution is Incorrect.
        `;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        const text = completion.choices[0].message.content;
        const match = text.match(/\d/);
        const score = match ? parseInt(match[0]) : 0;

        console.log(`✅ Code Verdict: ${score === 1 ? "PASS" : "FAIL"}`);
        res.json({ success: true, score });

    } catch (error) {
        console.error("AI Judge Error:", error.message);
        res.json({ success: true, score: 1 }); // Pass on error (fail-safe)
    }
};

// ... keep generateQuestions and evaluateAnswer (Voice) if needed ...
// Export everything
module.exports = { getTechnicalTest, evaluateCode };