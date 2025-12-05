const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const jobRoutes = require('./routes/jobRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import Routes
const authRoutes = require('./routes/authRoutes');

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express App
const app = express();

// 4. Middleware (The Gatekeepers)
app.use(express.json()); // Allows reading JSON data
app.use(cors());         // Allows Frontend to talk to Backend

// 5. Define Routes
app.use('/api/auth', authRoutes); // Connects the Resume Parser & Auth
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

// 6. Basic Test Route
app.get('/', (req, res) => {
    res.send('API is running... NexWork Server is Live! 🚀');
});

// 7. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 NexWork Server running on port ${PORT}`);
    console.log(`🔗 Local Link: http://localhost:${PORT}`);
});