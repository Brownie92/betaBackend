const Round = require('../models/Round');
const Race = require('../models/Race');
const Vote = require('../models/Vote');
const roundService = require('../services/roundService');
const { calculateProgressAndBoost } = require('../utils/raceUtils');
const { saveWinner } = require('../controllers/winnerController');
const { sendRaceUpdate, sendWinnerUpdate } = require('../socket'); // ⬅️ Removed sendRoundUpdate

/**
 * Fetch all rounds for a specific race
 * @route GET /api/rounds/:raceId
 */
const getRounds = async (req, res) => {
    const { raceId } = req.params;

    try {
        const rounds = await roundService.getRoundsByRace(raceId);
        res.status(200).json({ raceId, rounds });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rounds', error: error.message });
    }
};

/**
 * Process a new round: calculate progress and save the round
 */
const processRound = async (race) => {
    try {
        // ✅ Check if the race is already closed
        if (race.status === 'closed') {
            return { message: 'Race is closed. No further rounds can be processed.' };
        }

        // **1️⃣ Retrieve pending votes for the current round**
        const votes = await Vote.find({ raceId: race.raceId, roundNumber: race.currentRound, status: 'pending' });

        // **2️⃣ Calculate progress and boosts based on votes**
        const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes, votes);

        // **3️⃣ Create and save a new round**
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

        // **4️⃣ Retrieve all votes (processed + current round)**
        const voteCounts = await Vote.aggregate([
            { $match: { raceId: race.raceId } }, 
            { $group: { _id: "$memeId", totalVotes: { $sum: 1 } } }
        ]);

        // **5️⃣ Retrieve cumulative progress from the Round collection**
        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { $group: { _id: "$progress.memeId", totalProgress: { $sum: "$progress.progress" } } }
        ]);

        // **6️⃣ Update the Race collection with new progress & votes**
        race.memes = race.memes.map(meme => {
            const voteData = voteCounts.find(v => v._id?.toString() === meme.memeId?.toString()) || { totalVotes: 0 };
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { totalProgress: 0 };

            return {
                ...meme,
                progress: progressInfo.totalProgress, // ✅ Update progress
                votes: voteData.totalVotes // ✅ Update votes
            };
        });

        // **7️⃣ Mark votes for this round as 'processed'**
        await Vote.updateMany({ raceId: race.raceId, roundNumber: race.currentRound }, { status: 'processed' });

        // **8️⃣ Move to the next round or close the race**
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = 'closed';
            await race.save();
            try {
                await saveWinner(race.raceId);
                sendWinnerUpdate(race.raceId); // ✅ Send winner update to the frontend
            } catch (winnerError) {
                console.error(`Error saving winner:`, winnerError);
            }
            return { race, newRound };
        }

        // ✅ Save race before sending WebSocket updates
        await race.save();

        // ✅ Send WebSocket update at the right place
        sendRaceUpdate(race); 

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