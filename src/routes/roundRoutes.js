const express = require("express");
const router = express.Router();
const roundController = require("../controllers/roundController");
const Race = require("../models/Race");
const { calculateProgressAndBoost } = require("../utils/raceUtils");

// ✅ Retrieve all rounds for a specific race
router.get("/:raceId", roundController.getRounds);

// ✅ Manually process a round
router.post("/:raceId/process-round", async (req, res) => {
    try {
        const { raceId } = req.params;
        const race = await Race.findOne({ raceId });

        if (!race) {
            return res.status(404).json({ message: "Race not found" });
        }

        const result = await roundController.processRound(race, calculateProgressAndBoost);
        res.status(200).json({ message: "Round processed successfully", result });
    } catch (error) {
        console.error("[ERROR] Failed to process round:", error);
        res.status(500).json({ message: "Failed to process round", error: error.message });
    }
});

module.exports = router;