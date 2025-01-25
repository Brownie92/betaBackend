const express = require('express');
const { startRace, getRace } = require('../controllers/raceController');
const { registerWallet } = require('../controllers/entryController');
const router = express.Router();

// Start a new race
router.post('/', startRace);

// Register a wallet for a race
router.post('/:raceId/entry', registerWallet);

// Get race details by ID (including participants)
router.get('/:raceId', getRace);

module.exports = router;