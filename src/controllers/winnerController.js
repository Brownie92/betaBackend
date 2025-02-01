const Winner = require('../models/Winner');
const Race = require('../models/Race');
const Vote = require('../models/Vote');
const { sendWinnerUpdate } = require('../socket'); // ✅ WebSocket import

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
            return existingWinner; // 🚀 Winner al opgeslagen, geen dubbele entry maken
        }

        // ✅ Query alle stemmen uit de `Vote` collectie (status: 'processed')
        const votesPerMeme = await Vote.aggregate([
            { $match: { raceId, status: 'processed' } },
            { $group: { _id: "$memeId", totalVotes: { $sum: 1 } } }
        ]);

        // ✅ Haal het totaal aantal stemmen van de winnaar op
        const winnerVotes = votesPerMeme.find(v => v._id.toString() === winningMeme.memeId.toString());
        const totalVotes = winnerVotes ? winnerVotes.totalVotes : 0;

        // ✅ Sla de winnaar correct op
        const winner = new Winner({
            raceId: race.raceId,
            memeId: winningMeme.memeId,
            progress: winningMeme.progress,
            votes: totalVotes, // ✅ Nu met de juiste stemmen uit de `Vote` collectie
        });

        await winner.save();

        // ✅ WebSocket event versturen naar frontend
        console.log("[DEBUG] 🟡 Sending winner update via WebSocket");
        sendWinnerUpdate(winner);

        return winner;
    } catch (error) {
        console.error(`[ERROR] ❌ Failed to save winner:`, error);
        throw error;
    }
};

module.exports = { saveWinner };