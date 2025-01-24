const express = require('express');
const Meme = require('../models/memeModels'); // Zorg dat je het model correct importeert

const router = express.Router();

// Route om alle memes op te halen
router.get('/', async (req, res) => {
  try {
    const memes = await Meme.find(); // Haal alle memes op
    res.json(memes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// Export de router
module.exports = router;