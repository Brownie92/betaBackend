const Round = require("../models/Round");

/**
 * Retrieves all rounds for a specific race.
 * @param {string} raceId - The race ID.
 * @returns {Promise<Array>} - A list of rounds for the specified race.
 */
const getRoundsByRace = async (raceId) => {
    try {
        return await Round.find({ raceId }).sort({ roundNumber: 1 });
    } catch (error) {
        console.error("[ERROR] ❌ Failed to retrieve rounds:", error);
        throw error;
    }
};

module.exports = {
    getRoundsByRace,
};