const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  raceId: { type: String, required: true },
  wallet: { type: String, required: true },
  chosenMeme: { type: String, required: true },
});

module.exports = mongoose.model('Participant', participantSchema);