const Vote = require('../models/Vote');
const Race = require('../models/Race');
const Participant = require('../models/Participant');

/**
 * Breng een stem uit op een meme in een actieve race.
 * @route POST /api/votes/:raceId
 */
const castVote = async (req, res) => {
    const { raceId } = req.params;
    const { walletAddress, memeId } = req.body;

    try {
        // ✅ **1️⃣ Controleer of de race actief is**
        const race = await Race.findOne({ raceId, status: 'active' });
        if (!race) {
            return res.status(400).json({ message: 'Race is niet actief of bestaat niet' });
        }

        // ✅ **2️⃣ Blokkeer stemmen in ronde 1**
        if (race.currentRound === 1) {
            return res.status(403).json({ message: 'Stemmen is niet toegestaan in ronde 1' });
        }

        // ✅ **3️⃣ Controleer of de gebruiker een deelnemer is**
        const participant = await Participant.findOne({ raceId, walletAddress });
        if (!participant) {
            return res.status(403).json({ message: 'Je bent geen deelnemer van deze race' });
        }

        // ✅ **4️⃣ Controleer of de deelnemer al heeft gestemd in deze ronde**
        if (participant.hasVotedInRounds.includes(race.currentRound)) {
            return res.status(403).json({ message: 'Je hebt al gestemd in deze ronde' });
        }

        // ✅ **5️⃣ Controleer of de deelnemer in ronde 1 een meme heeft gekozen**
        if (!participant.memeId) {
            return res.status(403).json({ message: 'Je hebt in ronde 1 geen meme gekozen en kunt niet stemmen' });
        }

        // ✅ **6️⃣ Vanaf ronde 2: Controleer of de deelnemer op de juiste meme stemt**
        if (memeId !== participant.memeId.toString()) {
            return res.status(403).json({ message: 'Je kunt alleen stemmen op de meme die je in ronde 1 hebt gekozen' });
        }

        // ✅ **7️⃣ Sla de stem op in de Vote-collectie**
        const newVote = new Vote({
            raceId,
            roundNumber: race.currentRound,
            walletAddress,
            memeId,
        });

        await newVote.save();

        // ✅ **8️⃣ Update participant om te registreren dat deze gebruiker heeft gestemd**
        participant.hasVotedInRounds.push(race.currentRound);
        await participant.save();

        res.status(201).json({ message: 'Stem succesvol uitgebracht', vote: newVote });
    } catch (error) {
        console.error('[ERROR] Fout bij stemmen:', error);
        res.status(500).json({ message: 'Fout bij stemmen', error: error.message });
    }
};

module.exports = {
    castVote
};