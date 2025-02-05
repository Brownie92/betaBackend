const Winner = require('../models/Winner');
const Race = require('../models/Race');
const Vote = require('../models/Vote');
const { sendWinnerUpdate } = require('../socket');

/**
 * Sla de winnaar op zodra de race is afgesloten
 */
const saveWinner = async (raceId) => {
    try {
        const race = await Race.findOne({ raceId });

        if (!race || race.status !== 'closed') {
            return;
        }

        // ✅ Zoek de winnaar in de race (degene met de hoogste progress)
        const winningMeme = race.memes.reduce((max, meme) =>
            meme.progress > max.progress ? meme : max
        );

        // ✅ Controleer of de winnaar al is opgeslagen
        const existingWinner = await Winner.findOne({ raceId });
        if (existingWinner) {
            return existingWinner;
        }

        // ✅ Query alle stemmen uit de `Vote` collectie
        const votesPerMeme = await Vote.aggregate([
            { $match: { raceId, status: 'processed' } },
            { $group: { _id: "$memeId", totalVotes: { $sum: 1 } } }
        ]);

        // ✅ Haal stemmen van de winnaar op
        const winnerVotes = votesPerMeme.find(v => v._id.toString() === winningMeme.memeId.toString());
        const totalVotes = winnerVotes ? winnerVotes.totalVotes : 0;

        // ✅ Sla de winnaar op
        const winner = new Winner({
            raceId: race.raceId,
            memeId: winningMeme.memeId,
            progress: winningMeme.progress,
            votes: totalVotes,
        });

        await winner.save();

        // ✅ WebSocket event sturen
        sendWinnerUpdate(winner);

        return winner;
    } catch (error) {
        console.error(`[ERROR] ❌ Failed to save winner:`, error);
        throw error;
    }
};

/**
 * Haal de winnaar op voor een race
 */
const getWinnerByRaceId = async (raceId) => {
    try {
        console.log(`[INFO] 🏆 Opvragen winnaar voor race ${raceId}`);

        // ✅ Haal winnaar op en vul meme-informatie aan
        const winner = await Winner.findOne({ raceId }).populate("memeId");

        if (!winner) {
            console.warn(`[WARNING] ❌ Geen winnaar gevonden voor race ${raceId}`);
            return null;
        }

        return winner;
    } catch (error) {
        console.error(`[ERROR] ❌ Fout bij ophalen winnaar:`, error);
        throw error;
    }
};

module.exports = { saveWinner, getWinnerByRaceId };