const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  raceId: { type: String, required: true },
  roundNumber: { type: Number, required: true },
  progress: [
    {
      meme: { type: String, required: true },
      progress: { type: Number, required: true }, // Vereist veld
    },
  ],
  votes: [
    {
      meme: { type: String, required: true },
      votes: { type: Number, required: true },
    },
  ],
  winner: { type: String, required: true }, // Vereist veld
});

module.exports = mongoose.model('Round', roundSchema);