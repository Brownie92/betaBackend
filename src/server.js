require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

// **Import WebSocket module**
const socket = require('./socket');

// **Initialize Express + HTTP server**
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dapp';

// **Middleware: CORS & JSON parsing**
app.use(cors());
app.use(express.json());

// **Connect to MongoDB**
mongoose.connect(MONGO_URI)
    .then(() => console.log('[INFO] ✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('[ERROR] ❌ MongoDB connection failed:', err);
        process.exit(1);
    });

// **Initialize WebSocket & store reference**
const io = socket.initSocket(server);

if (!io) {
    console.error("[ERROR] ❌ WebSocket initialization failed!");
} else {
    console.log("[INFO] 🔄 WebSocket successfully initialized!");
}

// **Import API routes**
app.use('/api/memes', require('./routes/memeRoutes'));
app.use('/api/races', require('./routes/raceRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/rounds', require('./routes/roundRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));
app.use('/api/winners', require('./routes/winnerRoutes'));

// **Fallback route for 404 errors**
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// **Global error handling middleware**
app.use((err, req, res, next) => {
    console.error('[ERROR] ❌ Internal Server Error:', err.stack);
    res.status(500).json({ message: '❌ Internal Server Error', error: err.message });
});

// **Start the round scheduler**
require('./schedulers/roundScheduler');

// **Start the server**
server.listen(PORT, () => {
    console.log(`[INFO] 🚀 Server is running on http://localhost:${PORT}`);
});

// **Export WebSocket events**
module.exports = {
    io,
    sendRaceCreated: socket.sendRaceCreated,
    sendRaceUpdate: socket.sendRaceUpdate,
    sendRoundUpdate: socket.sendRoundUpdate,
    sendWinnerUpdate: socket.sendWinnerUpdate
};