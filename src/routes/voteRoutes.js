const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

// ✅ Breng een stem uit
router.post('/:raceId', voteController.castVote);

// ✅ Haal stemmen op per raceId en ronde
router.get('/:raceId', voteController.getVotesForRound);

module.exports = router;