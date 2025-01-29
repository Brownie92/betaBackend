const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true },
    roundNumber: { type: Number, required: true },
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme', required: true },
    walletAddress: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'processed'], default: 'pending' } // ✅ Nieuw veld
}, { timestamps: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;