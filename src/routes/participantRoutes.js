const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// Endpoint om een deelnemer te registreren
router.post('/', participantController.registerParticipant);

// Endpoint om alle deelnemers van een race op te halen
router.get('/:raceId', participantController.getParticipantsByRace);

module.exports = router;