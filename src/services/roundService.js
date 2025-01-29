const Round = require('../models/Round');

/**
 * Haal alle rondes op voor een specifieke race
 * @param {String} raceId - De ID van de race
 * @returns {Array} - Lijst van rondes voor de race
 */
const getRoundsByRace = async (raceId) => {
    try {
        const rounds = await Round.find({ raceId }).sort({ roundNumber: 1 });
        console.log(`[DEBUG] Retrieved ${rounds.length} rounds for race ${raceId}`);
        return rounds;
    } catch (error) {
        console.error('[ERROR] Failed to retrieve rounds:', error);
        throw error;
    }
};

module.exports = {
    getRoundsByRace,
};