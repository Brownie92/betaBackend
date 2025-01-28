const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Winner Schema
const winnerSchema = new Schema({
  raceId: { type: String, required: true, unique: true },
  winner: { type: String, required: true },
  finalProgress: [
    {
      name: { type: String, required: true },
      progress: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('Winner', winnerSchema);