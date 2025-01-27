const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  raceId: { type: String, required: true }, // ID van de race
  round: { type: Number, required: true }, // Ronde waarin is gestemd
  wallet: { type: String, required: true }, // Wallet-adres van de deelnemer
  meme: { type: String, required: true }, // Naam van de gekozen meme
  timestamp: { type: Date, default: Date.now } // Tijdstip van stemmen
});

module.exports = mongoose.model('Vote', voteSchema);