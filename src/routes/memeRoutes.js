const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');

// Haal alle memes op
router.get('/', memeController.getAllMemes);

// Voeg een nieuwe meme toe
router.post('/', memeController.createMeme);

module.exports = router;