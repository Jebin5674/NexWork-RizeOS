const OpenAI = require("openai"); 
const pdf = require('pdf-parse'); // Version 1.1.1 works as a function directly

const parseResume = async (fileBuffer) => {
    console.log("--- 📄 STARTING REAL PDF PARSE ---");

    try {
        // 1. EXTRACT TEXT
        // With v1.1.1, we can just call pdf() directly
        console.log("...Reading Buffer...");
        
        const data = await pdf(fileBuffer);
        const resumeText = data.text;

        if (!resumeText || resumeText.length < 10) {
            throw new Error("PDF text extracted is empty.");
        }

        console.log(`✅ PDF Read Success! Extracted ${resumeText.length} characters.`);

        // 2. SETUP GROQ
        if (!process.env.GROQ_API_KEY) throw new Error("No GROQ_API_KEY in .env");

        const groq = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1" 
        });

        // 3. SEND TO AI
        console.log("...Sending to Groq...");
        
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: "You are a JSON parser. Extract technical skills from the resume. Return ONLY a raw JSON array of strings. Example: [\"React\", \"Python\"]. Do not output markdown." 
                },
                { 
                    role: "user", 
                    content: `Resume Text: ${resumeText.substring(0, 6000)}` 
                }
            ],
            temperature: 0.1,
        });

        const text = completion.choices[0].message.content;
        
        // Clean result
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']');
        
        let extractedSkills = [];
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = text.substring(jsonStart, jsonEnd + 1);
            extractedSkills = JSON.parse(jsonString);
        } else {
            extractedSkills = ["Manual Review Needed"];
            console.log("Raw AI Response:", text);
        }

        console.log("✅ GROQ SUCCESS! Skills:", extractedSkills);

        return {
            success: true,
            textSnippet: resumeText.substring(0, 100) + "...",
            skills: extractedSkills
        };

    } catch (error) {
        console.error("❌ PARSING ERROR:", error.message);
        return {
            success: false, 
            skills: [],
            error: error.message
        };
    }
};

module.exports = parseResume;