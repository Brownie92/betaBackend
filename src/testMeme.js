const mongoose = require('mongoose');
const Meme = require('../src/models/Meme'); // Zorg ervoor dat dit pad correct is!
require('dotenv').config(); // Laad je database-configuratie

const MONGO_URI = process.env.MONGO_URI || 'mongodb://dappUser:S3cur3@localhost:27017/dapp';

const testMemes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('[DEBUG] ✅ Connected to MongoDB');

        // Test 1: Hoeveel memes zitten er in de database?
        const memeCount = await Meme.countDocuments();
        console.log(`[DEBUG] Total memes in DB: ${memeCount}`);

        // Test 2: Haal 6 random memes op met $sample
        const randomMemes = await Meme.aggregate([{ $sample: { size: 6 } }]);
        console.log("[DEBUG] Random memes (via $sample):", JSON.stringify(randomMemes, null, 2));

        // Test 3: Haal 6 memes op zonder $sample
        const fallbackMemes = await Meme.find({}).limit(6);
        console.log("[DEBUG] First 6 memes (via find + limit):", JSON.stringify(fallbackMemes, null, 2));

        mongoose.connection.close();
    } catch (error) {
        console.error('[ERROR] Test failed:', error);
        mongoose.connection.close();
    }
};

testMemes();