const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true }, // ✅ The race this vote belongs to
    roundNumber: { type: Number, required: true }, // ✅ The round in which the vote was cast
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme', required: true }, // ✅ Reference to the meme being voted for
    walletAddress: { type: String, required: true, index: true }, // ✅ Voter's wallet address
    status: { type: String, enum: ['pending', 'processed'], default: 'pending' } // ✅ Field to track vote processing status
}, { timestamps: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;