const Race = require('../models/Race');
const Meme = require('../models/Meme');
const Participant = require('../models/Participant');

/**
 * Registreer een deelnemer bij een race
 */
const registerParticipant = async (req, res) => {
    try {
        const { raceId, walletAddress, memeId } = req.body;

        // Check of alle verplichte velden zijn meegegeven
        if (!raceId || !walletAddress || !memeId) {
            return res.status(400).json({ message: "Race ID, Wallet Address en Meme ID zijn verplicht" });
        }

        // Check of de race bestaat
        const raceExists = await Race.findOne({ raceId });
        if (!raceExists) {
            return res.status(404).json({ message: "Race niet gevonden" });
        }

        // Check of de gekozen meme bestaat
        const memeExists = await Meme.findById(memeId);
        if (!memeExists) {
            return res.status(404).json({ message: "Gekozen meme niet gevonden" });
        }

        // Controleer of deze wallet al geregistreerd is voor deze race
        const existingParticipant = await Participant.findOne({ raceId, walletAddress });
        if (existingParticipant) {
            return res.status(400).json({ message: "Je bent al geregistreerd voor deze race" });
        }

        // Maak en sla de nieuwe deelnemer op
        const newParticipant = new Participant({
            raceId,
            walletAddress,
            memeId
        });

        await newParticipant.save();
        res.status(201).json({ message: "Deelnemer succesvol geregistreerd", participant: newParticipant });

    } catch (error) {
        console.error("[ERROR] Failed to register participant:", error);
        res.status(500).json({ message: "Fout bij registreren van deelnemer", error: error.message });
    }
};

/**
 * Haal alle deelnemers van een specifieke race op
 */
const getParticipantsByRace = async (req, res) => {
    const { raceId } = req.params;

    try {
        const participants = await Participant.find({ raceId });
        res.status(200).json({ raceId, participants });
    } catch (error) {
        console.error('[ERROR] Failed to fetch participants:', error);
        res.status(500).json({ message: 'Interne serverfout' });
    }
};

module.exports = {
    registerParticipant,
    getParticipantsByRace,
};