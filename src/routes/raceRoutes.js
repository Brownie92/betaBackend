const express = require('express');
const { startRace, getRace, updateRaceStatus } = require('../controllers/raceController');

const router = express.Router();

router.post('/', startRace); // Start een nieuwe race
router.get('/:raceId', getRace); // Haal racegegevens op
router.patch('/:raceId/status', updateRaceStatus); // Wijzig de status van een race

module.exports = router;