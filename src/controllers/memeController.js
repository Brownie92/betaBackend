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

const getMemesByIds = async (req, res) => {
    const { memeIds } = req.body; // Verwacht een lijst van memeId's

    if (!memeIds || !Array.isArray(memeIds)) {
        return res.status(400).json({ message: "Invalid request: memeIds should be an array" });
    }

    try {
        const memes = await Meme.find({ memeId: { $in: memeIds } }); // Haal alle memes op die in de lijst zitten
        res.status(200).json(memes);
    } catch (error) {
        console.error("[ERROR] ❌ Kan memes niet ophalen:", error);
        res.status(500).json({ message: "Failed to fetch memes" });
    }
};

module.exports = {
    getAllMemes,
    createMeme,
    getMemesByIds 
};