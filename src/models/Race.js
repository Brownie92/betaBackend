const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true }, // Uniek ID voor de race
    memes: [
        {
            memeId: { type: String, required: true }, // Uniek kenmerk per meme
            name: { type: String, required: true },
            url: { type: String, required: true },
            votes: { type: Number, default: 0 },
            progress: { type: Number, default: 0 },
        }
    ],
    currentRound: { type: Number, default: 1 }, // De huidige ronde (1 t/m 6)
    roundEndTime: { type: Date, required: true }, // Tijdstip waarop de ronde eindigt
    status: { type: String, enum: ['active', 'closed'], default: 'active' }, // Status van de race
}, { timestamps: true });

const Race = mongoose.model('Race', raceSchema);
module.exports = Race;