const Meme = require('../models/Meme');
const mongoose = require("mongoose");

// 🔹 Haal alle memes op
const getAllMemes = async (req, res) => {
    try {
        const memes = await Meme.find().lean(); // ✅ `lean()` maakt de query sneller
        res.status(200).json(memes);
    } catch (error) {
        console.error('[ERROR] ❌ Failed to fetch memes:', error);
        res.status(500).json({ message: 'Failed to fetch memes', error: error.message });
    }
};

// 🔹 Voeg een nieuwe meme toe
const createMeme = async (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(400).json({ message: "Invalid request: name and url are required" });
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
        console.error('[ERROR] ❌ Failed to create meme:', error);
        res.status(500).json({ message: 'Failed to create meme', error: error.message });
    }
};

// 🔹 Haal memes op op basis van een lijst van memeIds
const getMemesByIds = async (req, res) => {
    const { memeIds } = req.body;

    if (!Array.isArray(memeIds) || memeIds.length === 0) {
        return res.status(400).json({ message: "Invalid request: memeIds should be a non-empty array" });
    }

    try {
        // 🔥 Converteer memeIds naar Strings en haal alleen de nodige velden op
        const memes = await Meme.find({ memeId: { $in: memeIds.map(String) } })
            .select("memeId name url") // ✅ Haal alleen de relevante velden op
            .lean(); // ✅ `lean()` maakt de query sneller

        if (memes.length === 0) {
            return res.status(404).json({ message: "No memes found for the provided IDs" });
        }

        res.status(200).json(memes);
    } catch (error) {
        console.error("[ERROR] ❌ Failed to fetch memes:", error);
        res.status(500).json({ message: "Failed to fetch memes", error: error.message });
    }
};

module.exports = {
    getAllMemes,
    createMeme,
    getMemesByIds
};