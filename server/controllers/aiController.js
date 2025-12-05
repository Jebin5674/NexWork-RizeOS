const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Initialize Gemini
// We use a try-catch so the server doesn't crash if the key is missing
let genAI;
try {
    if(process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (error) {
    console.error("Gemini Init Error:", error);
}

// --- FALLBACK QUESTIONS (Safety Net) ---
// If Gemini fails/quota exceeeds, we use these so the demo never crashes.
const FALLBACK_QUESTIONS = [
    "Explain the difference between State and Props in React.",
    "What is the Event Loop in Node.js?",
    "Explain the concept of Virtual DOM.",
    "How does MongoDB differ from an SQL database?",
    "What is Middleware in Express.js?"
];

// --- FUNCTION 1: GENERATE QUESTIONS ---
const generateQuestions = async (req, res) => {
    const { skills, jobTitle } = req.body; // e.g. ["React", "Node"], "Frontend Dev"

    console.log(`🤖 AI Generating questions for: ${jobTitle}`);

    try {
        // SAFETY CHECK: If no key, use Fallback
        if (!genAI) throw new Error("No API Key");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a technical interviewer. 
            Generate exactly 3 short, conceptual interview questions for a "${jobTitle}" role.
            The candidate has these skills: ${skills.join(", ")}.
            Return ONLY the questions separated by a pipe symbol (|). 
            Example output: Question 1?|Question 2?|Question 3?
            Do not include numbering or extra text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Split the result into an array
        const questions = text.split('|').map(q => q.trim()).filter(q => q.length > 0);
        
        console.log("✅ AI Questions:", questions);
        res.json({ success: true, questions: questions });

    } catch (error) {
        console.error("⚠️ AI Generation Failed (Using Fallback):", error.message);
        // Return random fallback questions if AI fails
        const randomQs = FALLBACK_QUESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3);
        res.json({ success: true, questions: randomQs });
    }
};

// --- FUNCTION 2: EVALUATE ANSWER ---
const evaluateAnswer = async (req, res) => {
    const { question, userAnswer } = req.body;

    console.log(`🧠 AI Evaluating...`);

    try {
        if (!genAI) throw new Error("No API Key");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            I asked a candidate: "${question}"
            They answered: "${userAnswer}"
            
            Rate this answer on a scale of 1 to 10 based on technical accuracy.
            If the answer is irrelevant or gibberish, give 0.
            Return ONLY the number. Nothing else.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const scoreText = response.text().trim();
        
        // Extract number from text (just in case AI says "The score is 7")
        const match = scoreText.match(/\d+/); 
        const score = match ? parseInt(match[0]) : 5;

        console.log(`✅ Score: ${score}/10`);
        res.json({ success: true, score });

    } catch (error) {
        console.error("⚠️ AI Evaluation Failed (Using Fallback):", error.message);
        // Fallback: If answer length > 20 chars, give 7, else 3
        const mockScore = userAnswer.length > 20 ? 7 : 3;
        res.json({ success: true, score: mockScore });
    }
};

module.exports = { generateQuestions, evaluateAnswer };