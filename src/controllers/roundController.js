const Round = require('../models/Round');
const Race = require('../models/Race');
const Vote = require('../models/Vote');
const roundService = require('../services/roundService');
const { calculateProgressAndBoost } = require('../utils/raceUtils');
const { saveWinner } = require('../controllers/winnerController');

/**
 * Haal alle rondes op voor een specifieke race
 * @route GET /api/rounds/:raceId
 */
const getRounds = async (req, res) => {
    const { raceId } = req.params;

    try {
        const rounds = await roundService.getRoundsByRace(raceId);
        res.status(200).json({ raceId, rounds });
    } catch (error) {
        res.status(500).json({ message: 'Fout bij ophalen van rondes', error: error.message });
    }
};

/**
 * Verwerk een nieuwe ronde: bereken voortgang en sla de ronde op
 */
const processRound = async (race) => {
    try {
        // **1️⃣ Haal pending votes op voor deze ronde**
        const votes = await Vote.find({ raceId: race.raceId, roundNumber: race.currentRound, status: 'pending' });

        // **2️⃣ Bereken voortgang en boosts op basis van stemmen**
        const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes, votes);

        // **3️⃣ Maak een nieuwe ronde aan en sla op**
        const newRound = new Round({
            raceId: race.raceId,
            roundNumber: race.currentRound,
            progress: roundLog.progress.map(meme => ({
                memeId: meme.memeId,
                progress: meme.progress,
                boosted: meme.boosted,
                boostAmount: meme.boostAmount
            })),
            winner: roundLog.winner
        });
        await newRound.save();

        // **4️⃣ Stemmen tellen uit `votes`-collectie**
        const voteCounts = await Vote.aggregate([
            { $match: { raceId: race.raceId, status: 'processed' } },
            { $group: { _id: "$memeId", totalVotes: { $sum: 1 } } }
        ]);

        // **5️⃣ Progress cumulatief ophalen uit `rounds`-collectie**
        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { $group: { _id: "$progress.memeId", totalProgress: { $sum: "$progress.progress" } } }
        ]);

        // **6️⃣ Update progress & votes in `Race`**
        race.memes = race.memes.map(meme => {
            const voteData = voteCounts.find(vote => vote._id?.toString() === meme.memeId?.toString()) || { totalVotes: 0 };
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { totalProgress: 0 };

            return {
                ...meme,
                progress: progressInfo.totalProgress, // ✅ Progress uit `rounds`-collectie halen
                votes: voteData.totalVotes // ✅ Votes correct updaten
            };
        });

        // **7️⃣ Markeer votes als 'processed'**
        await Vote.updateMany({ raceId: race.raceId, roundNumber: race.currentRound }, { status: 'processed' });

        // **8️⃣ Update race naar volgende ronde of sluit af**
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = 'closed';
            await race.save();
            try {
                await saveWinner(race.raceId);
            } catch (winnerError) {
                console.error(`Fout bij opslaan van winnaar:`, winnerError);
            }
            return { race, newRound };
        }

        await race.save();
        return { race, newRound };
    } catch (error) {
        console.error('[ERROR] Failed to process round:', error);
        throw error;
    }
};

module.exports = {
    getRounds,
    processRound
};