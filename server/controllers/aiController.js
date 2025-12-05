const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
let genAI;
try {
    if(process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (error) {
    console.error("Gemini Init Error:", error);
}

// 1. GENERATE QUESTIONS
const generateQuestions = async (req, res) => {
    const { skills, jobTitle } = req.body; 
    console.log(`🤖 Generative AI: Creating questions for ${jobTitle}...`);

    try {
        // Fallback if no key
        if (!genAI) throw new Error("No API Key configured");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate 5 technical interview questions for a "${jobTitle}" role with skills: ${skills.join(", ")}. Return ONLY the questions separated by a pipe symbol (|). Do not number them.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and split
        const questions = text.replace(/\*/g, '').split('|').map(q => q.trim()).filter(q => q.length > 0);
        
        res.json({ success: true, questions: questions.slice(0, 5) });

    } catch (error) {
        console.error("AI Error:", error.message);
        // Fallback Questions so app doesn't crash
        res.json({ success: true, questions: [
            "Describe a challenging technical problem you solved.",
            "How do you handle state management in complex applications?",
            "Explain the concept of API rate limiting.",
            "What is your preferred workflow for debugging?",
            "How do you ensure code quality in a team?"
        ]});
    }
};

// 2. EVALUATE ANSWER
const evaluateAnswer = async (req, res) => {
    const { question, userAnswer } = req.body;
    console.log(`🧠 AI Judging Answer...`);

    try {
        if (!genAI) throw new Error("No API Key");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Question: "${question}"\nCandidate Answer: "${userAnswer}"\n\nRate this answer from 1 to 10 based on technical accuracy. Return ONLY the number.`;

        const result = await model.generateContent(prompt);
        const scoreText = result.response.text();
        const match = scoreText.match(/\d+/);
        const score = match ? parseInt(match[0]) : 5;

        res.json({ success: true, score });

    } catch (error) {
        console.error("AI Judge Error:", error.message);
        res.json({ success: true, score: 7 }); // Default score on error
    }
};

module.exports = { generateQuestions, evaluateAnswer };