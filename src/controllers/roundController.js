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
        // Haal pending votes op voor deze ronde
        const votes = await Vote.find({ raceId: race.raceId, roundNumber: race.currentRound, status: 'pending' });

        // Bereken voortgang en boosts op basis van stemmen
        const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes, votes);

        // Maak een nieuwe ronde aan en sla op
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

        // Markeer votes als 'processed'
        await Vote.updateMany({ raceId: race.raceId, roundNumber: race.currentRound }, { status: 'processed' });

        // Update race naar volgende ronde of sluit af
        race.memes = updatedMemes.map(meme => ({ ...meme, votes: 0 }));

        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = 'closed';
            await race.save(); // Race afsluiten in DB
            try {
                await saveWinner(race.raceId); // Winnaar opslaan
            } catch (winnerError) {
                console.error(`Fout bij opslaan van winnaar:`, winnerError);
            }
            return { race, newRound };
        }

        await race.save();
        return { race, newRound };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getRounds,
    processRound
};