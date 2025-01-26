const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  raceId: { type: String, required: true, unique: true },
  memes: [
    {
      name: { type: String, required: true },
      votes: { type: Number, default: 0 },
      progress: { type: Number, default: 0 },
    },
  ],
  participants: [
    {
      wallet: { type: String, required: true }, // Correcte syntax
      chosenMeme: { type: String, required: true }, // Correcte syntax
    },
  ],
  currentRound: { type: Number, default: 1 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  roundEndTime: { type: Date, required: true },
});

module.exports = mongoose.model('Race', raceSchema);