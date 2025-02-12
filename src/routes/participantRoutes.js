const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// ✅ Register a new participant
router.post('/', participantController.registerParticipant);

// ✅ Fetch all participants for a specific race
router.get('/:raceId', participantController.getParticipantsByRace);

module.exports = router;