const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const Vote = require('../models/Vote');

// Breng een stem uit
router.post('/:raceId', voteController.castVote);

// ✅ Haal stemmen op per raceId en groepeer per memeId
router.get('/:raceId', async (req, res) => {
    try {
        const { raceId } = req.params;

        // Groepeer stemmen per memeId (alleen die met status 'pending')
        const votesPerMeme = await Vote.aggregate([
            { $match: { raceId, status: 'pending' } },
            { $group: { _id: "$memeId", totalVotes: { $sum: 1 } } }
        ]);

        res.status(200).json(votesPerMeme);
    } catch (error) {
        console.error("❌ Error fetching votes:", error);
        res.status(500).json({ message: "Failed to fetch votes" });
    }
});

module.exports = router;