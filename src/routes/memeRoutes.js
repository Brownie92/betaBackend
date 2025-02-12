const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');

// ✅ Fetch all memes
router.get('/', memeController.getAllMemes);

// ✅ Fetch memes based on a list of meme IDs
router.post('/byIds', memeController.getMemesByIds);

// ✅ Add a new meme
router.post('/', memeController.createMeme);

module.exports = router;