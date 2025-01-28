const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  raceId: { type: String, required: true },
  wallet: { type: String, required: true },
  chosenMeme: { type: String, required: true }, // Meme waarop deze deelnemer kan stemmen
  votes: [
    {
      roundNumber: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ], // Houdt bij in welke rondes er is gestemd
});

module.exports = mongoose.model('Participant', participantSchema);