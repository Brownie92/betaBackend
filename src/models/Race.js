const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
    raceId: { type: String, unique: true, required: true },
    memes: [
      {
        name: String,
        url: String,
        votes: Number,
        progress: Number,
      },
    ],
    currentRound: { type: Number, default: 1 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    roundEndTime: { type: Date, required: true },
  });
  
  module.exports = mongoose.model('Race', raceSchema);