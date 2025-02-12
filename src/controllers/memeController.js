const Meme = require('../models/Meme');
const mongoose = require("mongoose");

// 🔹 Fetch all memes
const getAllMemes = async (req, res) => {
    try {
        const memes = await Meme.find().lean(); // ✅ Using `lean()` for better performance
        res.status(200).json(memes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch memes', error: error.message });
    }
};

// 🔹 Create a new meme
const createMeme = async (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(400).json({ message: "Invalid request: name and URL are required" });
    }

    try {
        const existingMeme = await Meme.findOne({ name }).lean();
        if (existingMeme) {
            return res.status(400).json({ message: 'Meme already exists' });
        }

        const meme = new Meme({ name, url });
        await meme.save();

        res.status(201).json({ message: 'Meme created successfully', meme });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create meme', error: error.message });
    }
};

// 🔹 Fetch memes based on a list of meme IDs
const getMemesByIds = async (req, res) => {
    const { memeIds } = req.body;

    if (!Array.isArray(memeIds) || memeIds.length === 0) {
        return res.status(400).json({ message: "Invalid request: memeIds should be a non-empty array" });
    }

    try {
        // Convert memeIds to Strings and fetch only the required fields
        const memes = await Meme.find({ memeId: { $in: memeIds.map(String) } })
            .select("memeId name url") // ✅ Fetch only relevant fields
            .lean(); // ✅ Optimized query with `lean()`

        if (memes.length === 0) {
            return res.status(404).json({ message: "No memes found for the provided IDs" });
        }

        res.status(200).json(memes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch memes", error: error.message });
    }
};

module.exports = {
    getAllMemes,
    createMeme,
    getMemesByIds
};