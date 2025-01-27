const express = require('express');
const { startRace, getRace } = require('../controllers/raceController');
const { registerWallet } = require('../controllers/entryController');
const { voteForMeme } = require('../controllers/voteController'); // Nieuwe controller importeren
const router = express.Router();

// Race starten
router.post('/', startRace);

// Wallet registratie
router.post('/:raceId/entry', registerWallet);

// Stemmen
router.post('/:raceId/vote', voteForMeme); // Stem-functionaliteit

// Race details ophalen
router.get('/:raceId', getRace);

module.exports = router;