# NexWork: The AI-Verified, Web3-Secured Professional Network

**NexWork** is a full-stack job and networking portal designed to solve the core trust issues in modern hiring. By integrating a Web3 payment gate, an automated multi-stage AI interviewer, and a transparent application tracker, it creates a fair, efficient, and secure ecosystem for both recruiters and job seekers.

This project was built as a comprehensive showcase of full-stack development (MERN), Web3 integration (Ethers.js, MetaMask), and practical AI/NLP application (Groq API, Llama 3).

**Live Demo:** [https://nex-work-rize-os.vercel.app/](https://nex-work-rize-os.vercel.app/)
*(Note: The backend is hosted on Render's free tier and may take 30-50 seconds to "wake up" on the first request.)*

---

## 🚀 Core Features

### For Job Seekers
*   **AI Resume Parser:** Upload your resume and let our AI (powered by Groq) automatically extract and populate your key skills.
*   **Real Skill Matching:** The "Recommended" feed uses a dynamic algorithm to show you jobs where your skills are a true fit (>=50% match).
*   **Two-Phase AI Interview:** Prove your skills in a fair, unbiased screening process:
    1.  **Voice Interview:** Answer 5 conceptual questions to demonstrate your communication and thought process.
    2.  **Coding Test:** Solve 3 LeetCode-style problems (Easy, Medium, Hard) to validate your technical ability.
*   **The "Glass Box" Tracker:** No more ghosting. See the real-time status of your application as it moves through the automated and manual review stages.

### For Recruiters
*   **Web3 Payment Gate:** Post jobs by paying a small, on-chain fee with MetaMask (Polygon). This eliminates spam and ensures only serious listings populate the platform.
*   **Automated Candidate Screening:** The AI Interview acts as your first-round technical interviewer, saving you countless hours. You only see candidates who have already passed the conceptual and coding tests.
*   **Customizable Coding Tests:** Configure the difficulty of the 3 coding problems (Easy, Medium, Hard) for each job post to match the role's requirements.
*   **Private, Secure Dashboard:** Manage your job postings and view AI-vetted candidates in a dashboard that only shows jobs created by you.

---

## 🛠️ Tech Stack & Architecture

This project is a **monorepo** with a clear separation between the client and server.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js, Vite, React Router | Fast, modern UI and navigation. |
| **Styling** | Inline Styles (CSS-in-JS) | Stable, scoped styling for components. |
| **Backend** | Node.js, Express.js | REST API for handling all application logic. |
| **Database**| MongoDB Atlas | Cloud-hosted NoSQL database for users, jobs, & applications. |
| **Blockchain** | Polygon (Testnet: Sepolia/Amoy) | Low-cost, fast on-chain transactions. |
| **Web3 Lib**| Ethers.js | For connecting the React app to MetaMask. |
| **AI Brain** | Groq API (Llama 3) | For resume parsing, question generation, and code evaluation. |
| **Speech** | Web Speech API | Browser-native, lightweight Speech-to-Text & Text-to-Speech. |
| **Deployment** | Vercel (Frontend), Render (Backend) | Global, production-ready hosting. |

---

## ⚙️ Local Setup & Installation

Follow these steps to run the project on your local machine.

### Prerequisites
*   Node.js (v18 or later)
*   npm
*   MongoDB (local instance or a MongoDB Atlas account)
*   MetaMask browser extension

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/NexWork-RizeOS.git
cd NexWork-RizeOS```

### 2. Setup the Backend (`/server`)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create a .env file and add your variables
touch .env
Fill server/.env with the following (replace with your own keys):
code
Env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@your_cluster_url/nexwork_db
JWT_SECRET=your_jwt_secret
ADMIN_WALLET_ADDRESS=your_metamask_admin_address
GROQ_API_KEY=gsk_your_groq_api_key
3. Setup the Frontend (/client)
code
Bash
# Navigate to client directory from root
cd client

# Install dependencies
npm install

# Create a .env file for local development
touch .env
Fill client/.env with the following:```env
VITE_API_URL=http://localhost:5000
code
Code
### 4. Run the Application
You will need two separate terminals.

**In Terminal 1 (from `/server`):**
```bash
npm start
Your backend should be running on http://localhost:5000.
In Terminal 2 (from /client):
code
Bash
npm run dev
Your frontend will open on http://localhost:5173.
🎥 Final Thoughts
This project was an incredible learning experience, blending the three core pillars of modern web development: robust full-stack architecture, decentralized Web3 mechanics, and intelligent AI-driven user flows. The goal was not just to build features, but to build a product with a strong point of view on how to solve real-world problems in the hiring industry.
code
Code
