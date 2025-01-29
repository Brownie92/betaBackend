const Round = require('../models/Round');
const Race = require('../models/Race');
const Vote = require('../models/Vote');
const roundService = require('../services/roundService');
const { calculateProgressAndBoost } = require('../utils/raceUtils');

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
        console.error('[ERROR] Fout bij ophalen van rondes:', error);
        res.status(500).json({ message: 'Fout bij ophalen van rondes', error: error.message });
    }
};

/**
 * Verwerk een nieuwe ronde: bereken voortgang en sla de ronde op
 */
const processRound = async (race) => {
    try {
        console.log(`[DEBUG] Processing round ${race.currentRound} for race ${race.raceId}`);

        // **1️⃣ Haal alleen pending votes op voor deze ronde**
        const votes = await Vote.find({ raceId: race.raceId, roundNumber: race.currentRound, status: 'pending' });
        console.log(`[DEBUG] Found ${votes.length} votes for round ${race.currentRound}`);

        // **2️⃣ Bereken voortgang en boosts op basis van stemmen**
        const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes, votes);

        // **3️⃣ Maak een nieuwe ronde in de database**
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

        console.log("[DEBUG] Round to be saved:", JSON.stringify(newRound, null, 2));
        await newRound.save();
        console.log(`[DEBUG] Round ${newRound.roundNumber} saved for race ${race.raceId}`);

        // **4️⃣ Markeer votes als 'processed' in plaats van te verwijderen**
        await Vote.updateMany({ raceId: race.raceId, roundNumber: race.currentRound }, { status: 'processed' });
        console.log(`[DEBUG] Votes for round ${race.currentRound} marked as processed`);

        // **5️⃣ Update de race naar de volgende ronde**
        race.memes = updatedMemes.map(meme => ({ ...meme, votes: 0 })); // Reset stemmen
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = 'closed';
            console.log(`[DEBUG] Race ${race.raceId} is now closed`);
        }

        await race.save();
        console.log(`[DEBUG] Race ${race.raceId} updated successfully`);

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