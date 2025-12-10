const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Read from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected to Cloud: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;