const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true }, // Race waaraan deze ronde is gekoppeld
    roundNumber: { type: Number, required: true }, // Ronde nummer (1-6)
    progress: [
        {
            memeId: { type: String, required: true }, // ✅ Gebruik String, zoals in Race en Vote
            progress: { type: Number, required: true }, // Progressie van deze ronde
            boosted: { type: Boolean, default: false }, // Of deze meme een boost kreeg
            boostAmount: { type: Number, default: 0 } // Hoeveel de boost was
        }
    ],
    winner: { type: String, required: false }, // ✅ Ook hier String i.p.v. ObjectId
}, { timestamps: true });

const Round = mongoose.model('Round', roundSchema);
module.exports = Round;