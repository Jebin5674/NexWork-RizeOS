const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// Helper to init Groq
const getGroq = () => {
    if (!process.env.GROQ_API_KEY) throw new Error("No GROQ_API_KEY");
    return new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
};

// --- VOICE INTERVIEW FUNCTIONS ---

const generateVoiceQuestions = async (req, res) => {
    const { skills, jobTitle } = req.body;
    console.log(`🤖 Groq: Generating 5 VOICE questions for ${jobTitle}...`);
    try {
        const groq = getGroq();
        // UPDATED PROMPT: Requesting 5 Questions
        const prompt = `Generate exactly 5 short conceptual interview questions for a "${jobTitle}" role with skills: ${skills.join(", ")}. Return ONLY the questions separated by a pipe symbol (|). Do not number them.`;
        
        const completion = await groq.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.7 });
        const text = completion.choices[0].message.content;
        const questions = text.split('|').map(q => q.trim()).filter(q => q.length > 5);

        // Ensure we send exactly 5
        res.json({ success: true, questions: questions.slice(0, 5) });

    } catch (error) {
        // Return 5 generic fallback questions
        res.json({ success: true, questions: [
            "Explain a recent project you worked on.",
            "What is your biggest strength?",
            "Why do you want this role?",
            "Describe a time you faced a technical challenge.",
            "How do you stay up-to-date with technology?"
        ]});
    }
};

// ... keep other functions as they are ...

const evaluateSpokenAnswer = async (req, res) => {
    const { question, userAnswer } = req.body;
    console.log(`🧠 Groq: Judging SPOKEN answer...`);
    try {
        const groq = getGroq();
        const prompt = `Question: "${question}"\nAnswer: "${userAnswer}"\nIs this a relevant, coherent answer? Return ONLY "1" for Yes or "0" for No.`;
        const completion = await groq.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.1 });
        const text = completion.choices[0].message.content;
        const match = text.match(/\d/);
        res.json({ success: true, score: match ? parseInt(match[0]) : 1 });
    } catch (error) {
        res.json({ success: true, score: 1 });
    }
};

// --- CODING TEST FUNCTIONS ---

const getTechnicalTest = async (req, res) => {
    const { testConfig } = req.body;
    console.log("📚 Getting CODING questions from bank...");
    try {
        const dataPath = path.join(__dirname, '../data/questions.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        let selectedQuestions = [];
        testConfig.forEach(level => {
            const pool = data[level.toLowerCase()];
            if (pool) selectedQuestions.push(pool[Math.floor(Math.random() * pool.length)]);
        });
        res.json({ success: true, questions: selectedQuestions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load question bank." });
    }
};

const evaluateCode = async (req, res) => {
    const { questionTitle, userCode } = req.body;
    console.log(`🧠 Groq: Judging CODE for ${questionTitle}...`);
    try {
        const groq = getGroq();
        const prompt = `Problem: "${questionTitle}". Code: "${userCode}". Is this a correct logical solution? Return ONLY "1" for Yes or "0" for No.`;
        const completion = await groq.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.1 });
        const text = completion.choices[0].message.content;
        const match = text.match(/\d/);
        res.json({ success: true, score: match ? parseInt(match[0]) : 0 });
    } catch (error) {
        res.json({ success: true, score: 1 });
    }
};

module.exports = { generateVoiceQuestions, evaluateSpokenAnswer, getTechnicalTest, evaluateCode };