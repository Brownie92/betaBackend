const Meme = require('../models/Meme');

// Haal alle memes op
const getAllMemes = async (req, res) => {
    try {
        const memes = await Meme.find();
        res.status(200).json(memes);
    } catch (error) {
        console.error('[ERROR] Failed to fetch memes:', error);
        res.status(500).json({ message: 'Failed to fetch memes' });
    }
};

// Voeg een nieuwe meme toe
const createMeme = async (req, res) => {
    const { name, url } = req.body;

    try {
        const existingMeme = await Meme.findOne({ name });
        if (existingMeme) {
            return res.status(400).json({ message: 'Meme already exists' });
        }

        const meme = new Meme({ name, url });
        await meme.save();

        res.status(201).json({ message: 'Meme created successfully', meme });
    } catch (error) {
        console.error('[ERROR] Failed to create meme:', error);
        res.status(500).json({ message: 'Failed to create meme' });
    }
};

module.exports = {
    getAllMemes,
    createMeme
};