const express = require('express');
const router = express.Router();
const { saveWinner, getWinnerByRaceId } = require('../controllers/winnerController');

// ✅ Haal de winnaar op
router.get('/:raceId', async (req, res) => {
    try {
        const winner = await getWinnerByRaceId(req.params.raceId);
        if (!winner) {
            return res.status(404).json({ error: 'Winner not found' });
        }
        res.status(200).json(winner);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch winner' });
    }
});

// ✅ Forceer het opslaan van de winnaar handmatig
router.post('/:raceId', async (req, res) => {
    try {
        await saveWinner(req.params.raceId);
        res.status(200).json({ message: 'Winner successfully saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save winner' });
    }
});

module.exports = router;