const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

// Breng een stem uit
router.post('/:raceId', voteController.castVote);

module.exports = router;