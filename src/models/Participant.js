const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true }, // Race waaraan deelnemer meedoet
    walletAddress: { type: String, required: true, index: true }, // Wallet adres van de deelnemer
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme', required: true }, // Gekozen meme
    hasVotedInRounds: { type: [Number], default: [] } // Lijst met rondes waarin deze deelnemer al heeft gestemd
}, { timestamps: true });

const Participant = mongoose.model('Participant', participantSchema);
module.exports = Participant;