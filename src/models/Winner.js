const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true, index: true }, 
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme', required: true }, 
    progress: { type: Number, required: true }, // ✅ Vereist veld
    votes: { type: Number, required: true }, // ✅ Vereist veld
}, { timestamps: true });

const Winner = mongoose.model('Winner', winnerSchema);
module.exports = Winner;