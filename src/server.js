require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

// **Importeer WebSocket-module**
const { initSocket, sendRaceCreated, sendRaceUpdate, sendRoundUpdate, sendWinnerUpdate } = require('./socket');

// **Express + HTTP server instellen**
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dapp';

// **CORS & JSON middleware**
app.use(cors());
app.use(express.json());

// **MongoDB connectie**
mongoose.connect(MONGO_URI)
    .then(() => console.log('[DEBUG] ✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('[ERROR] ❌ MongoDB connection error:', err);
        process.exit(1);
    });

// **WebSocket initialiseren**
const io = initSocket(server);

// **Routes importeren**
app.use('/api/memes', require('./routes/memeRoutes'));
app.use('/api/races', require('./routes/raceRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/rounds', require('./routes/roundRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));
app.use('/api/winners', require('./routes/winnerRoutes'));

// **Fallback route voor 404**
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// **Foutafhandeling**
app.use((err, req, res, next) => {
    console.error('[ERROR] ❌', err.stack);
    res.status(500).json({ message: '❌ Internal Server Error', error: err.message });
});

// **Scheduler starten**
require('./schedulers/roundScheduler');

// **Start server**
server.listen(PORT, () => {
    console.log(`[DEBUG] 🚀 Server is running on http://localhost:${PORT}`);
});

// **Exports voor WebSocket events**
module.exports = {
    io,
    sendRaceCreated,
    sendRaceUpdate,
    sendRoundUpdate,
    sendWinnerUpdate
};