const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
    memeId: { type: String, required: true, unique: true }, // ✅ Unique meme ID
    name: { type: String, required: true }, // ✅ Meme name
    url: { type: String, required: true } // ✅ Meme image URL
}, { timestamps: true });

const Meme = mongoose.model('Meme', memeSchema);
module.exports = Meme;