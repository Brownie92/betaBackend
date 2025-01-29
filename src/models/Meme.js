const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
    memeId: { type: String, required: true, unique: true }, // ✅ Unieke memeId
    name: { type: String, required: true },
    url: { type: String, required: true },
}, { timestamps: true });

const Meme = mongoose.model('Meme', memeSchema);
module.exports = Meme;