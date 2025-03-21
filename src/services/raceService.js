const Race = require("../models/Race");
const Meme = require("../models/Meme");

/**
 * Creates a new race with random memes.
 * @returns {Promise<Race>} The created race object.
 */
const createRace = async () => {
    const raceId = `race${Date.now()}`;

    try {
        // ✅ Check if there are enough memes in the database
        const totalMemes = await Meme.countDocuments();
        if (totalMemes < 6) {
            throw new Error("Not enough memes in the database to start a race");
        }

        // ✅ Retrieve 6 random memes
        const randomMemes = totalMemes === 6
            ? await Meme.find().limit(6)
            : await Meme.aggregate([{ $sample: { size: 6 } }]);

        // ✅ Create a new race
        const newRace = new Race({
            raceId,
            memes: randomMemes.map(meme => ({
                memeId: meme.memeId.toString(),
                name: meme.name,
                url: meme.url,
                votes: 0,
                progress: 0,
            })),
            currentRound: 1,
            roundEndTime: new Date(Date.now() + 3 * 60 * 1000),
        });

        // ✅ Save the race to the database
        await newRace.save();
        return newRace;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a race by its ID.
 * @param {string} raceId - The race ID.
 * @returns {Promise<Race|null>} The race object or null if not found.
 */
const getRaceById = async (raceId) => {
    return await Race.findOne({ raceId });
};

/**
 * Updates the status of a race.
 * @param {string} raceId - The race ID.
 * @param {string} status - The new race status.
 * @returns {Promise<Race|null>} The updated race object or null if not found.
 */
const updateRaceStatus = async (raceId, status) => {
    return await Race.findOneAndUpdate({ raceId }, { status }, { new: true });
};

module.exports = { createRace, getRaceById, updateRaceStatus };