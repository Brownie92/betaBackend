const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");

// ✅ Cast a vote for a meme in a race
router.post("/:raceId", voteController.castVote);

// ✅ Retrieve votes for a specific race and round
router.get("/:raceId", voteController.getVotesForRound);

module.exports = router;