const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    raceId: { type: String, required: true },
    roundNumber: { type: Number, required: true },
    memeId: { type: String, required: true }, // Consistentie behouden
    walletAddress: { type: String, required: true },
}, { timestamps: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;