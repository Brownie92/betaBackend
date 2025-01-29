const Winner = require('../models/Winner');
const Race = require('../models/Race');

/**
 * Sla de winnaar op zodra de race is afgesloten
 */
const saveWinner = async (raceId) => {
    try {
        const race = await Race.findOne({ raceId });

        if (!race || race.status !== 'closed') {
            return;
        }

        // Zoek de winnaar in de race (degene met de hoogste progress)
        const winningMeme = race.memes.reduce((max, meme) => 
            meme.progress > max.progress ? meme : max
        );

        // Controleer of de winnaar al is opgeslagen
        const existingWinner = await Winner.findOne({ raceId });
        if (existingWinner) {
            return;
        }

        // Sla de winnaar op in de database
        const winner = new Winner({
            raceId: race.raceId,
            memeId: winningMeme.memeId,
            progress: winningMeme.progress,
            votes: winningMeme.votes, // Aantal stemmen dat het laatst was opgeslagen
        });

        await winner.save();
    } catch (error) {
        throw error;
    }
};

module.exports = { saveWinner };