const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true, index: true }, // ✅ The race this winner belongs to
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme', required: true }, // ✅ The winning meme
    progress: { type: Number, required: true }, // ✅ Total progress achieved by the winner
    votes: { type: Number, required: true }, // ✅ Total votes received by the winner
}, { timestamps: true });

const Winner = mongoose.model('Winner', winnerSchema);
module.exports = Winner;