const express = require('express');
const Meme = require('../models/Meme');

const router = express.Router();

// Route for memes
router.get('/', async (req, res) => {
  try {
    const memes = await Meme.find();
    res.json(memes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// Export de router
module.exports = router;