// SIMULATED PARSER
// Note: Bypassing actual PDF parsing to ensure stability for the demo flow.

const HARDCODED_SKILLS = [
    "TensorFlow", 
    "PyTorch", 
    "Scikit-Learn", 
    "React", 
    "Next.js", 
    "Tailwind CSS", 
    "Node.js", 
    "Express.js", 
    "Django", 
    "MongoDB"
];

const parseResume = async (fileBuffer) => {
    console.log("--- Simulating Resume Parse ---");
    
    // We intentionally ignore the fileBuffer and return our "Golden List"
    // This ensures the frontend ALWAYS receives a perfect set of skills.
    
    return {
        success: true,
        textSnippet: "This is a simulated extraction of the candidate's resume focusing on Full Stack and AI capabilities...",
        skills: HARDCODED_SKILLS
    };
};

module.exports = parseResume;