const Race = require('../models/Race');
const Meme = require('../models/Meme');
const raceService = require('../services/raceService');

// Start een nieuwe race
const startRace = async (req, res) => {
    try {
        const race = await raceService.createRace();
        res.status(201).json({ message: 'Race created successfully', race });
    } catch (error) {
        console.error('[ERROR] Failed to start race:', error);
        res.status(500).json({ message: 'Failed to start race', error: error.message });
    }
};

// Haal een race op
const getRace = async (req, res) => {
    try {
        const race = await raceService.getRaceById(req.params.raceId);
        if (!race) return res.status(404).json({ message: 'Race not found' });
        res.status(200).json(race);
    } catch (error) {
        console.error('[ERROR] Failed to fetch race:', error);
        res.status(500).json({ message: 'Failed to fetch race', error: error.message });
    }
};

// Update de status van een race
const updateRaceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const race = await raceService.updateRaceStatus(req.params.raceId, status);
        if (!race) return res.status(404).json({ message: 'Race not found' });
        res.status(200).json({ message: 'Race status updated successfully', race });
    } catch (error) {
        console.error('[ERROR] Failed to update race status:', error);
        res.status(500).json({ message: 'Failed to update race status', error: error.message });
    }
};

module.exports = { startRace, getRace, updateRaceStatus };