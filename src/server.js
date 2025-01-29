// require('./cron/roundScheduler'); // Start de automatische scheduler
require('dotenv').config(); // Laad omgevingsvariabelen uit .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const memeRoutes = require('./routes/memeRoutes');
const raceRoutes = require('./routes/raceRoutes');
const voteRoutes = require('./routes/voteRoutes');
const roundRoutes = require('./routes/roundRoutes');
const participantRoutes = require('./routes/participantRoutes');
const winnerRoutes = require('./routes/winnerRoutes');

const app = express();
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dapp';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connectie
mongoose.connect(MONGO_URI)
    .then(() => console.log('[DEBUG] ✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('[ERROR] ❌ MongoDB connection error:', err);
        process.exit(1); // Stop de server als de database niet bereikbaar is
    });

// Routes
app.use('/api/memes', memeRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/winners', winnerRoutes);

// Fallback route voor niet-bestaande endpoints
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// Globale foutafhandeling
app.use((err, req, res, next) => {
    console.error('[ERROR] ❌', err.stack);
    res.status(500).json({ message: '❌ Internal Server Error', error: err.message });
});

require('./schedulers/roundScheduler');

// Start server
app.listen(PORT, () => {
    console.log(`[DEBUG] 🚀 Server is running on http://localhost:${PORT}`);
});