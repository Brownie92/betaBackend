const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
}, { collection: 'meme' });

module.exports = mongoose.model('Meme', memeSchema);