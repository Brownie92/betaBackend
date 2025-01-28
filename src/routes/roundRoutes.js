const express = require('express');
const { getRoundsByRaceId } = require('../controllers/roundController');

const router = express.Router();

// Endpoint voor ophalen van rondes per raceId
router.get('/:raceId', getRoundsByRaceId);

module.exports = router;