const Race = require('../models/Race');
const raceService = require('../services/raceService');
const { sendRaceCreated, sendRaceUpdate } = require('../socket'); // ✅ WebSockets via socket.js

// ✅ Start een nieuwe race
const startRace = async (req, res) => {
    try {
        const race = await raceService.createRace();

        // ✅ WebSocket: Stuur event naar frontend
        sendRaceCreated(race);

        res.status(201).json({ message: 'Race created successfully', race });
    } catch (error) {
        console.error('[ERROR] ❌ Failed to start race:', error);
        res.status(500).json({ message: 'Failed to start race', error: error.message });
    }
};

// ✅ Haal alle races op
const getAllRaces = async (req, res) => {
    try {
        const races = await Race.find(); // Alle races ophalen
        res.status(200).json(races);
    } catch (error) {
        console.error('[ERROR] ❌ Failed to fetch races:', error);
        res.status(500).json({ message: 'Failed to fetch races', error: error.message });
    }
};

// ✅ Haal een specifieke race op
const getRace = async (req, res) => {
    try {
        const race = await raceService.getRaceById(req.params.raceId);
        if (!race) return res.status(404).json({ message: 'Race not found' });
        res.status(200).json(race);
    } catch (error) {
        console.error('[ERROR] ❌ Failed to fetch race:', error);
        res.status(500).json({ message: 'Failed to fetch race', error: error.message });
    }
};

// ✅ Update de status van een race
const updateRaceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const race = await raceService.updateRaceStatus(req.params.raceId, status);
        if (!race) return res.status(404).json({ message: 'Race not found' });

        // ✅ WebSocket: Stuur race-status update
        sendRaceUpdate(race);

        res.status(200).json({ message: 'Race status updated successfully', race });
    } catch (error) {
        console.error('[ERROR] ❌ Failed to update race status:', error);
        res.status(500).json({ message: 'Failed to update race status', error: error.message });
    }
};

module.exports = { startRace, getAllRaces, getRace, updateRaceStatus };